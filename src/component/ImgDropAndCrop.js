import React, { useState, useRef, useCallback } from 'react';
import Dropzone from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import firebase, { storage } from '../firebase';
import { image64toCanvasRef, extractImageFileExtensionFromBase64, base64StringtoFile, downloadBase64File } from './base64';

const maxSize = 3000000
const acceptedFileTypes = 'image/x-png,image/png,image/jpg,image/jpeg,image/gif';
const acceptedFileTypesArray = acceptedFileTypes.split(',').map(item => { return item.trim() })



const ImgDropAndCrop = () => {

    const [imgSrc, setImgSrc] = useState(null);
    const imagePreviewCanvasRef = useRef();
    const [imgFromUrl, setImageFromUrl] = useState({ url: '', path: '' })
    const [imgExt, setImgExt] = useState();
    const [crop, setCrop] = useState({
        aspect: 3 / 2,
        //use can choose x,y,width,height initial and heightMax,heightMin,widthMax,widthMin
    });

    const verifyType = (files) => {
        if (files && files.length > 0) {
            const currentFile = files[0];
            const currentFileType = currentFile.type;
            const currentFileSize = currentFile.size;
            if (currentFileSize > maxSize) {
                alert('this file is too big')
                return false
            }
            if (!acceptedFileTypesArray.includes(currentFileType)) {
                alert("this file type is incorrect,only images are allowed")
                return false
            }
            return true
        }
    }
    const handleDrop = (files, rejectedFiles) => {
        //  console.log(files)
        //  console.log('reject file', rejectedFiles);
        if (rejectedFiles && rejectedFiles[0]) {
            verifyType(rejectedFiles)
        }
        if (files && files.length > 0) {
            const isVerify = verifyType(files)
            if (isVerify) {
                ///imageBase64Data
                const currentFile = files[0];
                const reader = new FileReader();
                reader.addEventListener('load', () => {

                    //console.log(reader.result)
                    const myResult = reader.result
                    setImgSrc(myResult);
                    setImgExt(extractImageFileExtensionFromBase64(myResult))
                }, false)

                reader.readAsDataURL(currentFile)
            }
        }
    }

    const handleImageLoaded = (image) => {

    }


    const handleCrop = (crop) => {
        //  console.log(crop)
        setCrop(crop)
    }

    const handleComplete = (crop, pixelCrop) => {
        console.log(crop)
        console.log(pixelCrop)

        // console.log(imgSrc)
        const canvasRef = imagePreviewCanvasRef.current;
        const imageSource = imgSrc;
        image64toCanvasRef(canvasRef, imageSource, pixelCrop)
    }

    const handleDownload = (e, type) => {
        e.preventDefault();
        const imageSource = imgSrc;
        if (imageSource) {
            const canvasRef = imagePreviewCanvasRef.current;

            const theImgExt = imgExt;

            const fileExtension = extractImageFileExtensionFromBase64(imgSrc);

            const imageData64 = canvasRef.toDataURL('image/' + theImgExt)

            const myFileName = "preview file." + fileExtension

            //file to be uploaded 
            if (type === 'upload') {
                const myNewCroppedFile = base64StringtoFile(imageData64, myFileName);
                uploadTheImage(myNewCroppedFile);
            }
            // download file
            if (type === 'download') {
                downloadBase64File(imageData64, myFileName)
            }
        }
    }
    const uploadTheImage = (file) => {
        var uploadTask = storage.ref('images').put(file);
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                console.log(error)
                // Handle unsuccessful uploads
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    setImageFromUrl({ url: downloadURL })
                    console.log('File available at', downloadURL);
                });
            })
    }
    return (
        <div>
            <h1>drop and crop</h1>
            {imgSrc ? <div style={{ margin: '0 5%' }}>


                <ReactCrop maxHeight={10000000} src={imgSrc} crop={crop} onChange={handleCrop} onImageLoaded={handleImageLoaded} onComplete={handleComplete} />
                <br />
                <p>preview crop image</p>

                <canvas ref={imagePreviewCanvasRef} onClick={e => console.log(e.target)} />
                <button onClick={e => handleDownload(e, 'download')}>download</button>
                <button onClick={e => handleDownload(e, 'upload')}>upload</button>

            </div>

                :
                <Dropzone multiple={false} accept={acceptedFileTypes} maxSize={maxSize} onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag and drop some files here, or click to select files</p>
                            </div>
                        </section>
                    )}
                </Dropzone>
            }
            {imgFromUrl.url &&
                <div style={{ margin: '0 5%' }}>
                    <h5>this is the cropped img from firebase storage</h5>
                    <img src={imgFromUrl.url} />
                </div>
            }

        </div>
    )
}

export default ImgDropAndCrop;