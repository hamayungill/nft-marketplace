import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeCategory, getCategories, upsertCategory, deleteCategory } from './Categories.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import moment from 'moment';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import defaultImg from '../../assets/img/faces/default_img.png';
import Select from 'react-select';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';


const Categories = (props) => {
    const [categories, setCategories] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [catModal, setCatModal] = useState(false)
    const [modalType, setModalType] = useState(0)
    const [category, setCategory] = useState(null)
    const [loader, setLoader] = useState(true)
    const [showClearBtn, setShowClearBtn] = useState(false)
    const [nameSearch, setNameSearch] = useState("")
    const [error, setError] = useState({})
    const [catType, setCatType] = useState(null)

    const catSearchInput = useRef()

    useEffect(() => {
        window.scroll(0, 0)
        props.getCategories()
    }, [])

    useEffect(() => {
        if (props.category.getCatAuth) {
            console.log("data is received by the API")
            const { categories, pagination } = props.category
            setCategories(categories)
            setPagination(pagination)
            props.beforeCategory()
        }
    }, [props.category.getCatAuth])

    useEffect(() => {
        if (categories) {
            setLoader(false)
            setCatModal(false)
        }
    }, [categories])

    // when category is created or updated
    useEffect(() => {
        if (props.category.upsertCatAuth) {
            let catRes = props.category.category

            if (catRes.success) {
                if (modalType === 1)
                    setCategories([...categories, catRes.category])
                else if (modalType === 2) {
                    const index = categories.findIndex((elem) => String(elem._id) === String(catRes.category._id))
                    if (index > -1) {
                        let catData = categories
                        catData[index] = catRes.category
                        setCategories([...catData])
                    }
                }
                setLoader(false)
                setCatModal(!catModal)
            } else
                setLoader(false)

            props.beforeCategory()
        }
    }, [props.category.upsertCatAuth])

    // when category is deleted
    useEffect(() => {
        if (props.category.deleteCatAuth) {
            const catRes = props.category.category
            if (catRes.success && pagination)
                onPageChange(pagination.page)
            props.beforeCategory()
        }
    }, [props.category.deleteCatAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    // set modal type
    const setModal = (type = 0, catId = null) => {
        setCatModal(!catModal)
        setModalType(type)
        setLoader(false)
        // add category
        if (type === 1) {
            let category = {
                name: '', image: '', description: '', status: true, type: '', min: '', max: '', typeId: ''
            }
            setCategory(category)
        }
        // edit category
        else if (type === 2 && catId)
            getCategory(catId)
    }

    const onChange = (e) => {
        let { name, value } = e.target

        // if status is provided
        if (name === 'status')
            value = !category.status

        let data = category
        data[name] = value

        setCategory({ ...data })
    }

    const onFileChange = (e) => {
        let file = e.target.files[0]
        let fileId = e.target.id
        if (file)
            if (file.type.includes('image')) {
                let data = category
                data = { ...data, [e.target.name]: file }
                setCategory(data)
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

    const validation = () => {
        let err = {}
        let isValid = true
        if (!category.name) {
            err["name"] = "Name is Required."
            isValid = false
        }
        if (!catType) {
            err["type"] = "Type must be selected."
            isValid = false
        }
        // if (!category.min) {
        //     err['min'] = "Min. Field is Required."
        //     isValid = false
        // }
        // if (!category.max) {
        //     err['max'] = "Max. Field is Required."
        //     isValid = false
        // }
        if (!category.image && modalType === 1) {
            err["image"] = "Image is Required."
            isValid = false
        }
        if (catType === "Select..." && modalType === 1) {
            err["type"] = "Type must be selected."
            isValid = false
        }
        // if (category.min > category.max && category.min >= 0) {
        //     err['min'] = "Min. Should be less then Max."
        //     if (category.max) {
        //         err['max'] = "Max. Should be greater then Min."
        //     }
        //     isValid = false
        // }
        // if (category.min < 0) {
        //     err['min'] = "Min. should be greater then or equal to 0."

        //     isValid = false
        // }
        // if (category.max < 0) {
        //     err['max'] = "Max. should be greater then or equal to 0."
        //     isValid = false
        // }
        setError(err)
        return isValid
    }

    const submit = () => {

        if (validation()) {
            console.log("category: ", category)
            setCatModal(!catModal)
            if (category.name && (category.image || modalType === 2)) {
                setLoader(true)
                var formData = new FormData()
                for (const key in category) {
                    if (key === "min" || key === "max") {
                        formData.append(key, 0)
                    }
                    else {
                        formData.append(key, category[key])
                    }
                }



                props.upsertCategory(`category/${modalType === 1 ? 'create' : 'edit'}`, formData, modalType === 1 ? 'POST' : 'PUT')
            }
        }
    }

    const deleteCategory = (catId) => {
        Swal.fire({
            title: 'Are you sure you want to delete?',
            html: 'If you delete an item, it would be permanently lost.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.value) {
                setLoader(true)
                props.deleteCategory(catId)
            }
        })
    }

    const getCategory = async (catId) => {
        setCategory({})
        setLoader(true)
        const catData = await categories.find((elem) => String(elem._id) === String(catId))
        if (catData) {
            setCategory(catData)
        }
        if (catData.type) {
            ENV.categoryOptions.map((e) => {
                if (e.value === catData.type) {
                    setCatType(e)
                    return
                }
            })
        }
        setLoader(false)
    }

    const onPageChange = async (page) => {
        setLoader(true)
        const qs = ENV.objectToQueryString({ page })
        props.getCategories(1, qs)
    }

    // apply search on category listing
    const applySearchCat = async (e) => {
        e.preventDefault()
        if (catSearchInput.current.value && catSearchInput.current.value !== nameSearch) {
            let name = catSearchInput?.current?.value
            name = name.trim() //remove extra spaces from both side of the @catSearchInput 
            let qs = { name: name }
            setLoader(true)
            props.getCategories(1, '', qs)
            setShowClearBtn(true)
            setNameSearch(name)
        }
    }

    const clearSearch = () => {
        catSearchInput.current.value = ""
        setLoader(true)
        props.getCategories()
        setNameSearch("")
        setShowClearBtn(false)
    }

    return (
        <>
            {
                loader &&
                <FullPageLoader />
            }
            <Container fluid>
                <Row>
                    <Col md={12}>
                        <Card.Header className="mb-5 head-grid">
                            <div className='main-flex d-flex justify-content-between align-items-center mb-4'>
                                <div>
                                    <Card.Title as="h4">Categories</Card.Title>
                                    <p className="card-category">List of Categories</p>
                                </div>
                                <div>
                                    <Button
                                        className="float-sm-right yellow-button"
                                        onClick={() => { setModal(1); setError({}); toast.dismiss(); setCatType("Select...") }}>
                                        Add Category
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <form onSubmit={(e) => { applySearchCat(e) }}>
                                    <div className="form-w">
                                        <Row>
                                            <Col xl={4} md={6} sm={8}>
                                                <label className="text-white">Name:</label>
                                                <input className="form-control" ref={catSearchInput} placeholder="Enter Name" />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="srch-btn my-bt">
                                        <button type="submit" className="btn red-button" >Apply Search</button>

                                        {
                                            showClearBtn && <button className="btn red-outline" onClick={clearSearch}>Clear</button>
                                        }
                                    </div>
                                </form>
                            </div>
                        </Card.Header>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Card className="table-big-boy">
                            <Card.Body className="table-full-width">
                                <div className='table-responsive'>
                                    <Table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-center td-start">#</th>
                                                <th className="td-image">Image</th>
                                                <th className="td-name">Name</th>
                                                <th className="td-description">Description</th>
                                                <th className="td-type">Type</th>
                                                {/* <th className="td-min">Min.</th>
                                                <th className="td-max">Max.</th> */}
                                                <th className="td-created">Created At</th>
                                                <th className="text-center td-actions">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                categories && categories.length ?
                                                    categories.map((category, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="text-center">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                <td>
                                                                    <div className="img-container">
                                                                        <img alt="Category Image" style={{ height: 100, width: 100, objectFit: "contain" }} className="img-fluid" src={category.imageCloudinaryUri} onError={(e) => { e.target.onerror = null; e.target.src = defaultImg }} />
                                                                    </div>
                                                                </td>
                                                                <td className="td-name">
                                                                    {category.name}
                                                                </td>
                                                                <td >
                                                                    <p className="description">{category.description ? category.description : 'N/A'}</p>
                                                                </td>
                                                                <td className="">
                                                                    {category.type}
                                                                </td>
                                                                {/* <td className="">
                                                                    {category.min}
                                                                </td>
                                                                <td className="">
                                                                    {category.max}
                                                                </td> */}
                                                                <td className="td-number">{moment(category.createdAt).format('DD MMM YYYY')}</td>
                                                                <td className="td-actions">
                                                                <ReactTooltip />
                                                                    {/* <OverlayTrigger
                                                                        overlay={
                                                                            <Tooltip id="tooltip-436082023">
                                                                                Edit
                                                                            </Tooltip>
                                                                        }
                                                                        placement="top"
                                                                        delay={{ show: 100, hide: 150 }}
                                                                    > */}
                                                                            <Button
                                                                                data-tip="Edit"
                                                                                className="btn-link btn-icon"
                                                                                type="button"
                                                                                variant="success"
                                                                                onClick={() => { setModal(2, category._id); setError({}) }}
                                                                            >
                                                                                <i className="fas fa-edit"></i>
                                                                            </Button>
                                                                    {/* </OverlayTrigger> */}
                                                                    <OverlayTrigger
                                                                        overlay={
                                                                            <Tooltip id="tooltip-334669391">
                                                                                Delete
                                                                            </Tooltip>
                                                                        }
                                                                        placement="top"
                                                                        delay={{ show: 100, hide: 150 }}
                                                                    >
                                                                        <Button
                                                                            className="btn-link btn-icon"
                                                                            type="button"
                                                                            variant="danger"
                                                                            onClick={() => deleteCategory(category._id)}
                                                                        >
                                                                            <i className="fas fa-times"></i>
                                                                        </Button>
                                                                    </OverlayTrigger>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                    :
                                                    <tr>
                                                        <td colSpan="7" className="text-center">
                                                            <span className="no-data-found ">No Categories Found</span>
                                                        </td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                                {
                                    pagination &&
                                    <Pagination
                                        className="m-3"
                                        defaultCurrent={1}
                                        pageSize // items per page
                                        current={pagination.page} // current active page
                                        total={pagination.pages} // total pages
                                        onChange={onPageChange}
                                        locale={localeInfo}
                                    />
                                }
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {

                    modalType > 0 && category &&
                    <Modal className="modal-primary" onHide={() => { setCatModal(!catModal) }} show={catModal}>
                        <Modal.Header className="justify-content-center">
                            <Row>{modalType === 1 ? 'Add' : modalType === 2 ? 'Edit' : ''} Category</Row>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group>
                                    <label>Name <span className="text-danger">*</span></label>
                                    <Form.Control
                                        placeholder="Enter name"
                                        type="text"
                                        name="name"
                                        onChange={(e) => onChange(e)}
                                        defaultValue={category.name}
                                        required
                                    />
                                    {error["name"] && <p className="error">{error?.name}</p>}
                                </Form.Group>
                                <Form.Group>
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Enter Description"
                                        type="text"
                                        name="description"
                                        onChange={(e) => onChange(e)}
                                        defaultValue={category.description}
                                        className="form-control"
                                        rows={5}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <label>Image {modalType === 1 && <span className="text-danger">*</span>}</label>
                                    <div className="input-group form-group">
                                        <div className="custom-file">
                                            <input type="file" className="custom-file-input" id="category-image" accept=".png,.jpeg,.jpg" onChange={(e) => onFileChange(e)} name="image" />
                                            <label id="category-image-label" className="custom-file-label" htmlFor="image">Choose file</label>
                                        </div>
                                    </div>
                                    {error["image"] && <p className="error">{error?.image}</p>}
                                </Form.Group>
                                {/* <Form.Group>
                                    <label>Status</label>
                                    <Form.Check
                                        type="switch"
                                        id="category-status"
                                        className="mb-1"
                                        onChange={(e) => onChange(e)}
                                        name="status"
                                        defaultValue={true}
                                        checked={category.status}
                                    />
                                </Form.Group> */}
                                <Form.Group>
                                    <label>type<span className="text-danger">*</span></label>
                                    <Select
                                        className="react-select-custom"
                                        value={catType}
                                        onChange={(e) => {
                                            setCatType(e);
                                            let data = category;
                                            data["type"] = e.value;
                                            data["typeId"] = e.type
                                            setCategory({ ...data })
                                        }}
                                        options={ENV.categoryOptions}
                                    />
                                    {error["type"] && <p className="error">{error.type}</p>}
                                </Form.Group>
                                {/* <Form.Group>
                                    <label>Min<span className="text-danger">*</span></label>
                                    <Form.Control
                                        placeholder="Enter Min."
                                        type="Number"
                                        name="min"
                                        min="0"
                                        onChange={(e) => onChange(e)}
                                        defaultValue={category.min}
                                        required
                                    />
                                </Form.Group> */}
                                {/* {error["min"] && <p className="error">{error.min}</p>} */}
                                {/* <Form.Group>
                                    <label>Max<span className="text-danger">*</span></label>
                                    <Form.Control
                                        placeholder="Enter Max."
                                        type="Number"
                                        name="max"
                                        onChange={(e) => onChange(e)}
                                        defaultValue={category.max}
                                        required
                                    />
                                </Form.Group>
                                {error["max"] && <p className="error">{error.max}</p>} */}
                            </Form>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                className="btn btn-close"
                                onClick={() => setCatModal(!catModal)}
                                variant="link"
                            >
                                Close
                            </Button>
                            <Button
                                className="btn btn-save"
                                onClick={() => submit()}
                                variant="link"
                                disabled={loader}
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>
                }
            </Container>
        </>
    )
}

const mapStateToProps = state => ({
    category: state.category,
    error: state.error
});

export default connect(mapStateToProps, { beforeCategory, getCategories, upsertCategory, deleteCategory })(Categories);