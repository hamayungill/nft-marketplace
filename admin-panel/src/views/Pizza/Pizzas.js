import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforePizza, getPizzas } from './Pizzas.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import moment from 'moment';
import { Card, Table, Container, Row, Col, Button, Modal, Form, OverlayTrigger, Tooltip} from "react-bootstrap";
import defaultImg from '../../assets/img/faces/default_img.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
import { CSVLink } from "react-csv";
import { GET_PIZZAS_STATS } from 'redux/types';
import axios from 'axios';

const Pizzas = (props) => {
    const [pizzas, setPizzas] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [loader, setLoader] = useState(true)
    const [showClearBtn, setShowClearBtn] = useState(false)
    const [raritySearch, setRaritySearch] = useState("")
    const [startDateSearch, setStartDateSearch] = useState("")
    const [endDateSearch, setEndDateSearch] = useState("")
    const [textCopy, setTextCopy] = useState("")
    const [pizzasData, setPizzaData] = useState([])

    // filters input
    const rarityFilterInput = useRef()
    const startDateFilterInput = useRef()
    const endDateFitlerInput = useRef()

    useEffect(() => {
        window.scroll(0, 0)
        props.getPizzas()
    }, [])

    useEffect(() => {
        if (props.pizza.getPizzaAuth) {
            const { pizzas, pagination } = props.pizza
            csvData(pizzas)
            setPizzas(pizzas)
            setPagination(pagination)
            props.beforePizza()
        }
    }, [props.pizza.getPizzaAuth])

    useEffect(() => {
        if (pizzas) {
            setLoader(false)
        }
    }, [pizzas])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    // useEffect(() => {
    //     setLoader(false)
    //     if (props.pizza.rarityRewardSendAuth) {
    //         props.getPizzas()
    //     }
    // }, [props.pizza.rarityRewardSendAuth])

    const onPageChange = async (page) => {
        setLoader(true)
        const qs = ENV.objectToQueryString({ page })
        props.getPizzas(qs)
    }

    // apply search on pizza listing
    const applySearchPizza = async (e) => {
        e.preventDefault()
        if (rarityFilterInput.current.value && rarityFilterInput.current.value !== raritySearch || startDateFilterInput.current.value && startDateFilterInput.current.value !== startDateSearch || endDateFitlerInput.current.value && endDateFitlerInput.current.value !== endDateSearch) {
            let rarity = ""
            let startDate = ""
            let endDate = ""

            if (rarityFilterInput?.current?.value) {
                rarity = rarityFilterInput?.current?.value
                setRaritySearch(rarity)
            }
            if (startDateFilterInput?.current?.value) {
                startDate = startDateFilterInput?.current?.value
                setStartDateSearch(startDate)
            }
            if (endDateFitlerInput?.current?.value) {
                endDate = endDateFitlerInput?.current?.value
                setEndDateSearch(endDate)
            }

            let body = { rarity, startDate, endDate }
            setLoader(true)
            props.getPizzas("", body)
            setShowClearBtn(true)
        }
    }

    const clearSearch = () => {
        // clear inputs
        rarityFilterInput.current.value = ""
        startDateFilterInput.current.value = ""
        endDateFitlerInput.current.value = ""
        setRaritySearch("")
        setStartDateSearch("")
        setEndDateSearch("")
        setLoader(true)
        props.getPizzas()
        setShowClearBtn(false)
    }

    const handleCopy = (e, id) => {
        navigator.clipboard.writeText(id)
        setTextCopy(e);
    }

    const formattedAddress = (address) => {
        return `${address.slice(0, 5)}...${address.slice(-5)}`
    }

    const csvData = async(pizzas) => {
        let pData = []
        for (let index = 0; index < pizzas.length; index++) {
            const e = pizzas[index];
            let headers = [
                { label: "Image", key: "imageCloudinaryUrl" },
                { label: "Rarity", key: "rarity" },
                { label: "Creator", key: "creatorAddress" },
                { label: "BlockNumber", key: "blockNumber" }
            ];
            let data = []
            const {imageCloudinaryUrl, rarity, creatorAddress, blockNumber, contentIpfs, _pizzaId} = e
            const obj = {imageCloudinaryUrl, rarity, creatorAddress, blockNumber} 
    
            try {
                let res = await axios.get(contentIpfs)    
                let attrData = res.data?.attributes
                for (let index = 0; index < attrData.length; index++) {
                    const e  = attrData[index];
                    headers.push({ label: e?.trait_type, key: e?.trait_type })
                    obj[e?.trait_type] = e?.value
                }
                data.push(obj)
                pData[_pizzaId] = {data, headers}
            } catch (error) {
                console.log("Error =",error)
            }
        }
        
        setPizzaData(pData)   
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
                                    <Card.Title as="h4">Pizza's</Card.Title>
                                    <p className="card-category">List of Pizza's</p>
                                </div>
                            </div>
                            <div>
                                <form onSubmit={(e) => { applySearchPizza(e) }}>
                                    <div className="form-w">
                                        <Row>
                                            <Col xl={4} sm={6}>
                                                <label className="text-white">Name:</label>
                                                <input className="form-control" ref={rarityFilterInput} type="text" placeholder="Enter Rarity " />
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
                                    <Table className="table-striped w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-center td-start">#</th>
                                                <th className="td-image">Image</th>
                                                <th className="td-rarity">Rarity</th>
                                                <th className="td-creator">Creator</th>
                                                <th className="td-created">Created At</th>
                                                <th className="td-created">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                pizzas && pizzas.length ?
                                                    pizzas.map((pizza, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="text-center">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                <td>
                                                                    <div className="img-container">
                                                                        <img alt="Pizza Image" style={{ height: 100, width: 100, objectFit: "contain" }} className="img-fluid" src={pizza?.imageCloudinaryUrl} onError={(e) => { e.target.onError = null; e.target.src = defaultImg }} />
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {pizza.rarity ? pizza.rarity + " %" : 'N/A'}
                                                                </td>
                                                                <td className="" >
                                                                    {pizza.creatorAddress ?
                                                                        <div className='d-flex'>
                                                                            <span className='mr-2'>{formattedAddress(pizza.creatorAddress)}</span>
                                                                            <span className='copy-icon'>
                                                                                {
                                                                                    textCopy !== index ?
                                                                                        <FontAwesomeIcon icon={faCopy} onClick={(e) => handleCopy(index, pizza.creatorAddress)} /> : <p> copied </p>
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        :
                                                                        'N/A'
                                                                    }
                                                                </td>
                                                                {/* <td className="td-number">{moment(pizza.createdAt).format('DD MMM YYYY')}</td> */}
                                                                <td className="td-number"><a target="_blank" href={`${ENV.blockNumberExplorer}${pizza.blockNumber}`}>{pizza?.blockNumber}</a></td>
                                                                {
                                                                    pizzasData[pizza?._pizzaId] && 
                                                                    <td className="td-number">
                                                                        <OverlayTrigger
                                                                        overlay={
                                                                            <Tooltip id="tooltip-436082023">
                                                                                Download CSV
                                                                            </Tooltip>
                                                                        }
                                                                        placement="left"
                                                                    >
                                                                            <CSVLink data={pizzasData[pizza?._pizzaId]?.data} headers={pizzasData[pizza?._pizzaId]?.headers} filename={`pizza_${pizza?._pizzaId}.csv`}><FontAwesomeIcon icon={faDownload}/></CSVLink>
                                                                        </OverlayTrigger>
                                                                        </td>
                                                                }
                                                            </tr>
                                                        )
                                                    })
                                                    :
                                                    <tr>
                                                        <td colSpan="6" className="text-center">
                                                            <span className="no-data-found ">No Pizzas Found</span>
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
    pizza: state.pizza,
    error: state.error
});

export default connect(mapStateToProps, { beforePizza, getPizzas })(Pizzas);