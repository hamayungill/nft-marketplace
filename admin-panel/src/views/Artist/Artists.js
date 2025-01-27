import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeArtist, getArtists, upsertArtist, deleteArtist } from './Artist.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Button, Card, Table, Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import defaultImg from '../../assets/img/faces/face-0.jpg';

const Artists = (props) => {
    const [artists, setArtists] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [loader, setLoader] = useState(true)
    const [showClearBtn, setShowClearBtn] = useState(false)
    const [nameSearch, setNameSearch] = useState("")

    const artistSearchInput = useRef()

    useEffect(() => {

        window.scroll(0, 0)
        props.getArtists();
    }, [])

    useEffect(() => {
        if (props.artists.getArtistAuth) {
            const { artists, pagination } = props.artists;
            setArtists(artists)

            setPagination(pagination)
            props.beforeArtist()
        }
    }, [props.artists.getArtistAuth])

    useEffect(() => {
        if (artists) {
            setLoader(false)
        }
    }, [artists])

    //Artist Add Sucessfully
    useEffect(() => {
        if (props.artists.upsertArtistAuth) {
            setLoader(false)
        }
    }, [props.artists.upsertArtistAuth])

    // when artist is deleted
    useEffect(() => {
        if (props.artists.deleteArtistAuth) {
            const artistRes = props.artists.artist
            if (artistRes.success && pagination)
                onPageChange(pagination.page)
            props.beforeArtist()
        }
    }, [props.artists.deleteArtistAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    const deleteArtist = (Id) => {
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
                props.deleteArtist(Id);
            }
        })
    }

    const onPageChange = async (page) => {
        setLoader(true)
        const qs = ENV.objectToQueryString({ page })
        props.getArtists(qs)
    }

    // apply search on artist listing
    const applySearchArtist = async (e) => {
        e.preventDefault()
        if (artistSearchInput.current.value && artistSearchInput.current.value !== nameSearch) {
            let name = artistSearchInput?.current?.value
            name = name.trim()
            let body = { name: name }
            setLoader(true)
            props.getArtists('', body)
            setShowClearBtn(true)
            setNameSearch(name)

        }
    }

    const clearSearch = () => {
        artistSearchInput.current.value = ""
        setLoader(true)
        props.getArtists()
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
                                    <Card.Title as="h4">Artists</Card.Title>
                                    <p className="card-category">List of Artists</p>
                                </div>
                                <div>
                                    <Button
                                        className="float-sm-right yellow-button"
                                        onClick={() => props.history.push(`/artist`)}>
                                        Add Artist
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <form onSubmit={(e) => { applySearchArtist(e) }}>
                                    <div className="form-w">
                                        <Row>
                                            <Col xl={4} md={6} sm={8}>
                                                <label className="text-white">Name:</label>
                                                <input className="form-control" ref={artistSearchInput} placeholder="Enter name" />

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
                                                <th className="td-image">Image</th>
                                                <th className="td-name">Name</th>
                                                <th className="td-description">Description</th>
                                                <th className="td-detail">More Detail Link</th>
                                                <th className="td-created">Created At</th>
                                                <th className="text-center td-actions">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                artists && artists.length ?
                                                    artists.map((artist, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="text-center">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                <td>
                                                                    <div className="img-container">
                                                                        <img alt="Artist Image" style={{ height: 100, width: 100, objectFit: "contain" }} src={artist.imageCloudinaryUri} onError={(e) => { e.target.onerror = null; e.target.src = defaultImg }} className="img-fluid" />
                                                                    </div>
                                                                </td>
                                                                <td className="">
                                                                    {artist.name}
                                                                </td>
                                                                <td className="description" dangerouslySetInnerHTML={{ __html: artist?.description }}>
                                                                </td>
                                                                <td className="">
                                                                    {artist.learnMore ? artist.learnMore : 'N/A'}
                                                                </td>
                                                                <td className="td-number">{moment(artist.createdAt).format('DD MMM YYYY')}</td>
                                                                <td className="td-actions">
                                                                    <OverlayTrigger
                                                                        overlay={
                                                                            <Tooltip id="tooltip-436082023">
                                                                                Edit
                                                                            </Tooltip>
                                                                        }
                                                                        placement="left"
                                                                    >
                                                                        <Button
                                                                            className="btn-link btn-icon"
                                                                            type="button"
                                                                            variant="success"
                                                                            onClick={() => props.history.push(`/artist/${artist._id}`)}
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </Button>
                                                                    </OverlayTrigger>
                                                                    <OverlayTrigger
                                                                        overlay={
                                                                            <Tooltip id="tooltip-334669391">
                                                                                Delete
                                                                            </Tooltip>
                                                                        }
                                                                        placement="left"
                                                                    >
                                                                        <Button
                                                                            className="btn-link btn-icon"
                                                                            type="button"
                                                                            variant="danger"
                                                                            onClick={() => deleteArtist(artist._id)}
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
                                                            <span className="no-data-found ">No Artists Found</span>
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
    artists: state.artists,
    error: state.error
});

export default connect(mapStateToProps, { beforeArtist, getArtists, upsertArtist, deleteArtist })(Artists);
