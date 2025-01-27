import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { upsertArtist, getArtists, getArtist } from './Artist.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Form, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import $ from 'jquery';


const Artist = (props) => {
    const [submissionType, setSubmissionType] = useState(1)
    const [artist, setArtist] = useState({})
    const [ckDes, setCkDes] = useState()
    const [loader, setLoader] = useState(false)
    const [error, setError] = useState({})

    const { artistId } = useParams();

    useEffect(() => {
        let data = artist
        data["description"] = ckDes
        setArtist({ ...data })
    }, [ckDes])

    useEffect(() => {
        window.scroll(0, 0)
        if (artistId) {
            props.getArtist(artistId)
        }
    }, [])

    useEffect(() => {
        if (artistId) {
            setArtist({ description: props?.artist?.description, name: props?.artist?.name, _id: props?.artist?._id, learnMore: props?.artist?.learnMore , image: props?.artist?.image})
            setSubmissionType(2)
        }
    }, [props.artist])

    const onFileChange = (e) => {
        console.log("are you checking file")
        let file = e.target.files[0]
        let fileId = e.target.id
        if (file)
            if (file.type.includes('image')) {
                let data = artist
                data = { ...data, [e.target.name]: file }
                setArtist(data)
                if (file) {
                    var reader = new FileReader()
                    reader.onload = function (e) {
                        $(`#category-${fileId}`).attr('src', e.target.result)
                        $('#category-image-label').html('File selected')
                    }
                    reader.readAsDataURL(file)
                }
            } else {
                // TODO
                // $(`#category-${fileId}`).attr('src', placeholderImg)
                file = {}
            }
    }

    const onChange = (e) => {
        let { name, value } = e.target
        let data = artist
        data[name] = value
        setArtist({ ...data })

    }

    const validation = () => {
        let err = {}
        let isValid = true
        if (artist.learnMore) {
            let regex = new RegExp(/((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/)
            let val = artist.learnMore
            if (!val.match(regex)) {
                err["learnMore"] = "Field must be a URL."
                isValid = false
            }
        }
        if (!artist.name) {
            err["name"] = "Name is Required."
            isValid = false
        }
        if (!artist.description) {
            err["description"] = "Description is Required."
        }
        if (!artist.image && submissionType === 1) {
            err["image"] = "Image is Required."
        }
        setError(err)
        return isValid
    }

    const submit = async () => {
        setError({})
        if (validation()) {
            if (artist.description && artist.name && (artist.image || submissionType === 2)) {
                setLoader(true)
                var formData = new FormData()
                for (const key in artist)
                    formData.append(key, artist[key])
                props.upsertArtist(`artist/${submissionType === 1 ? 'create' : 'edit'}`, formData, submissionType === 1 ? 'POST' : 'PUT')
            }
        }
    }

    useEffect(() => {
        if (props?.artist?.success) {
            setLoader(false)
            props.history.push("/artists")
        } else {
            setLoader(false)
        }
    }, [props.artist])

    return (

        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Form>
                            <Form.Group className="mb-4">
                                <label className="text-white">Name<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter name"
                                    type="text"
                                    name="name"
                                    onKeyUp={(e) => onChange(e)}
                                    defaultValue={artist?.name}
                                    required
                                />
                                {error["name"] && <p className="error">{error.name}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Description<span className="text-danger">*</span></label>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={artist?.description}
                                    onChange={(event, editor) => {
                                        setCkDes(editor.getData())
                                    }}
                                />
                                {error["description"] && <p className="error">{error.description}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Image {submissionType === 1 && <span className="text-danger">*</span>}</label>
                                <div className="input-group form-group">
                                    <div className="custom-file">
                                        <input type="file" className="custom-file-input" id="category-image" accept=".png,.jpeg,.jpg" onChange={(e) => onFileChange(e)} name="image" />
                                        <label id="category-image-label" className="custom-file-label" htmlFor="image">{artist?.image ? "File Selected": "Choose file"}</label>
                                    </div>
                                </div>
                                {error["image"] && <p className="error">{error.image}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Learn More Link</label>
                                {console.log("artist?.learnMore: ",artist?.learnMore)}
                                <Form.Control
                                    placeholder="Enter Learn More Link"
                                    type="text"
                                    name="learnMore"
                                    onChange={(e) => onChange(e)}
                                    defaultValue={artist?.learnMore}
                                    required
                                />
                                {error["learnMore"] && <p className="error">{error.learnMore}</p>}
                            </Form.Group>
                            <div className="about-bt modal-footer">
                                <Button
                                    className="btn btn-close"
                                    onClick={() => props.history.push("/artists")}
                                    variant="link"
                                >
                                    Back
                                </Button>
                                <div className="my-bt">
                                    <Button
                                        className="btn btn-save btn-info"
                                        onClick={() => submit()}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    artist: state.artists?.artist,
    artists: state.artists,
    error: state.error
});

export default connect(mapStateToProps, { upsertArtist, getArtists, getArtist })(Artist);