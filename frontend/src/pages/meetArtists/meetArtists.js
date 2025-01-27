import React, { useState, useEffect } from 'react';
import Loader from '../../components/loader/loader';
import { Container, Row, Col } from 'react-bootstrap';
import './meetArtists.css';
import ArtistWrapper from '../../components/artistWrapper/artistWrapper';
import { getArtists, beforeArtists } from '../../redux/artist/Artists.action';

import { connect } from 'react-redux';



function MeetArtists(props) {

    //State
    const [artistList, setArtistList] = useState([])
    const [loader, setloader] = useState(true)

    useEffect(() => {
        props.beforeArtists()
        const callback = (bool) => {
            setloader(bool)
        }
        props.getArtists('', callback)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    useEffect(() => {
        // setFullLoader(false)
        if (props?.artists?.artists?.length) {
            setArtistList(props?.artists?.artists)
            setloader(false)
        }
    }, [props?.artists?.artists])

    return (
        <React.Fragment>
            {/* <Header /> */}
            <div className="meet-artist-section">
                <div className="meet-artist-head ff-lato">
                    <h2 className="red-color fw-bold mb-4">Meet Artists</h2>
                    <span>Meet our Awesome Artists</span>
                </div>
                <Container fluid>
                    <Row>
                        {/* Artist Data is given below */}

                        {
                            loader ?
                                <Loader />
                                :
                                artistList && artistList.map((item, index) => {
                                    return (
                                        <Col key={index} lg={4} md={6} className="p-0 mb-2">
                                            <ArtistWrapper artist={item} />
                                        </Col>
                                    )
                                })
                        }
                        {
                            !loader && !artistList?.length && <Col md={12} className="p-0"><div className="empty-box"><p>No artist available yet</p></div></Col>
                        }
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = state => ({
    artists: state.artist
})

export default connect(mapStateToProps, { getArtists, beforeArtists })(MeetArtists);