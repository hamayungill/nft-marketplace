import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeIngredient, getIngredients, upsertIngredient, deleteIngredient } from './Ingredients.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import moment from 'moment';
// import Swal from 'sweetalert2';
import { Button, Card, Table, Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import defaultImg from '../../assets/img/faces/default_img.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { fab, faEthereum } from '@fortawesome/free-brands-svg-icons'
// import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { checkIngredientMints } from "../../utils/web3"

const Ingredients = (props) => {
    const [ingredients, setIngredients] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [loader, setLoader] = useState(true)
    const [showClearBtn, setShowClearBtn] = useState(false)
    const [nameSearch, setNameSearch] = useState("")
    const [startDateSearch, setStartDateSearch] = useState("")
    const [endDateSearch, setEndDateSearch] = useState("")
    const [textCopy , setTextCopy] = useState("")

    // filters input
    const nameFilterInput = useRef()
    const startDateFilterInput = useRef()
    const endDateFitlerInput = useRef()

    useEffect(() => {
        window.scroll(0, 0)
        props.getIngredients()
    }, [])

    useEffect(() => {
        if (props.ingredient.getIngredientAuth) {
            const { ingredients, pagination } = props.ingredient
            prepareData(ingredients);
            setPagination(pagination)
            props.beforeIngredient()
        }
    }, [props.ingredient.getIngredientAuth])

    useEffect(() => {
        if (ingredients) {
            setLoader(false)
        }
    }, [ingredients])

    // when Ingredient is deleted
    useEffect(() => {
        if (props.ingredient.deleteIngredientAuth) {
            const ingredientRes = props.ingredient.ingredient
            if (ingredientRes.success && pagination)
                onPageChange(pagination.page)
            props.beforeIngredient()
        }
    }, [props.ingredient.deleteIngredientAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])


    const prepareData =  async (ingredientsArr) =>{
        let allIngredientsData =[]
        for (let l = 0; l < ingredientsArr.length; l++) {
            const ingredient = ingredientsArr[l]
            const res = await callIngredientMints(ingredient._ingredientId)
            ingredient.minted = res.minted
            ingredient.total = res.total
            allIngredientsData.push(ingredient)
            
        }
        setIngredients(allIngredientsData)
    }
    const onPageChange = async (page) => {
        setLoader(true)
        const qs = ENV.objectToQueryString({ page })
        props.getIngredients(qs)
    }

    // apply search on Ingredient listing
    const applySearchIngredient = async (e) => {
        e.preventDefault()
        if (nameFilterInput.current.value && nameFilterInput.current.value !== nameSearch || startDateFilterInput.current.value && startDateFilterInput.current.value !== startDateSearch || endDateFitlerInput.current.value && endDateFitlerInput.current.value !== endDateSearch) {
            let name = ""
            let startDate = ""
            let endDate = ""

            if (nameFilterInput?.current?.value) {
                name = nameFilterInput?.current?.value
                name = name.trim()
                setNameSearch(name)
            }
            if (startDateFilterInput?.current?.value) {
                startDate = startDateFilterInput?.current?.value
                setStartDateSearch(startDate)
            }
            if (endDateFitlerInput?.current?.value) {
                endDate = endDateFitlerInput?.current?.value
                setEndDateSearch(endDate)
            }

            let body = { name, startDate, endDate }
            setLoader(true)
            props.getIngredients("", body)
            setShowClearBtn(true)
        }

    }

    const clearSearch = () => {
        // clear inputs
        nameFilterInput.current.value = ""
        startDateFilterInput.current.value = ""
        endDateFitlerInput.current.value = ""
        setNameSearch("")
        setStartDateSearch("")
        setEndDateSearch("")
        setLoader(true)
        props.getIngredients()
        setShowClearBtn(false)
    }
    const handleCopy = (e, id) => {
        navigator.clipboard.writeText(id)
        setTextCopy(e);
    }
    const formattedAddress = (address) => {
        return `${address.slice(0, 5)}...${address.slice(-5)}`
    }

    const callIngredientMints = async (ingredientId) => {
        let mints = await checkIngredientMints(ingredientId);
        return mints;
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
                                    <Card.Title as="h4">Ingredients</Card.Title>
                                    <p className="card-category">List of Ingredient</p>
                                </div>
                                <div>
                                    <Button
                                        className="float-sm-right yellow-button"
                                        onClick={() => props.history.push("/ingredient")}>
                                        Add Ingredient
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <form onSubmit={(e) => { applySearchIngredient(e) }}>
                                    <div className="form-w">
                                        <Row>
                                            <Col xl={4} sm={6}>
                                                <label className="text-white">Name:</label>
                                                <input className="form-control" ref={nameFilterInput} type="text" placeholder="Enter Name" />

                                            </Col>
                                            <Col xl={4} sm={6}>
                                                <label className="text-white">Start Date:</label>
                                                <input className="form-control" ref={startDateFilterInput} type="date" max={moment().format("YYYY-MM-DD")} placeholder="Enter Start Date ..." />
                                            </Col>
                                            <Col xl={4} sm={6}>
                                                <label className="text-white">End Date:</label>
                                                <input className="form-control" ref={endDateFitlerInput} type="date" max={moment().format("YYYY-MM-DD")} placeholder="Enter End Date ..." />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="srch-btn my-bt">
                                        <button className="btn red-button" type="submit">Apply Search</button>
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
                                                <th className="td-image">Raw Image</th>
                                                <th className="td-image">Pizza Image</th>
                                                <th className="td-name">Name</th>
                                                <th className="td-category">Category</th>
                                                <th className="td-category">Layer Number</th>
                                                <th className='td-category'>Artist Address</th>
                                                <th className='td-category'>sold/supply</th>
                                                <th className="td-price">Price</th>
                                                <th className="td-created">Created At</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                
                                                ingredients && ingredients.length ?
                                                    ingredients.map((ingredient, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                {console.log("ingredients: ",ingredients)}
                                                                <td className="text-center">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                <td>
                                                                    <div className="img-container">
                                                                        <img alt="Ingredient Image" style={{ height: 100, width: 100, objectFit: "contain" }} className="img-fluid" src={ingredient.imageCloudinaryUrl} onError={(e) => { e.target.onerror = null; e.target.src = defaultImg }} />
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="img-container">
                                                                        <img alt="Ingredient Image" style={{ height: 100, width: 100, objectFit: "contain" }} className="img-fluid" src={ingredient.pizzaImageCloudinaryUrl} onError={(e) => { e.target.onerror = null; e.target.src = defaultImg }} />
                                                                    </div>
                                                                </td>
                                                                <td className="td-name">
                                                                    {ingredient.name}
                                                                </td>
                                                                <td className="td-name">
                                                                    {ingredient.categoryName}
                                                                </td>
                                                                <td className="td-name">
                                                                    {ingredient.layerNum}
                                                                </td>
                                                                <td className="td-name">
                                                                    {ingredient.artistAddress ? 
                                                                        <div className='d-flex'>
                                                                            <span className='mr-2'>{formattedAddress(ingredient.artistAddress)}</span>
                                                                            <span>
                                                                                {
                                                                                    textCopy !== index ?
                                                                                        <FontAwesomeIcon icon={faCopy} onClick={(e) => handleCopy(index, ingredient.artistAddress)} /> : <p> copied </p>
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        :
                                                                        'N/A'
                                                                    }
                                                                </td>
                                                                <td className="td-name">
                                                                    {ingredient._ingredientId ? <span>{ingredient?.minted} /{ingredient?.total}</span> : "N/A" }
                                                                </td>
                                                                <td >
                                                                    <span className='mr-2'>
                                                                        {ingredient.price ? ingredient.price : 'N/A'}
                                                                    </span>
                                                                    <FontAwesomeIcon icon={faEthereum} />
                                                                </td>
                                                                <td>{moment(ingredient.createdAt).format('DD MMM YYYY')}</td>
                                                            </tr>
                                                        )
                                                    })
                                                    :
                                                    <tr>
                                                        <td colSpan="10" className="text-center">
                                                            <span className="no-data-found ">No Ingredients Found</span>
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
            </Container>
        </>
    )
}

const mapStateToProps = state => ({
    ingredient: state.ingredient,
    error: state.error
});

export default connect(mapStateToProps, { beforeIngredient, getIngredients, upsertIngredient, deleteIngredient })(Ingredients);