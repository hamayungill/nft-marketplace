import React from 'react';
// import { Link } from 'react-router-dom';
import ArtistPlaceholder from '../../assets/images/artist-placeholder.png';
import './artistWrapper.css';

function ArtistWrapper(props) {
    const newTab = (url) => {
        window.open(`https://${url}`, '_blank').focus();
    }
    return (
        <React.Fragment>
            <div className="artist-wrapper">
                <div className="artist-data">
                    <div className="artist-image">
                        {props.artist && <img src={props.artist?.imageCloudinaryUri} onError={(e) => { e.target.onerror = null; e.target.alt = { ArtistPlaceholder } }} alt={"loading"} className="img-fluid" />}
                    </div>
                    <div className="artist-content">
                        <span className="ff-press-start fw-normal fst-normal">{props.artist && props.artist.name}</span>
                        {props.artist && <p className="ff-lato fst-normal artist-description" dangerouslySetInnerHTML={{ __html: props.artist.description }} />}
                    </div>
                    {/* description  to={`${props.artist.learnMore}`}*/}
                </div>
                <div className="artist-button">
                    {props.artist && <span onClick={() => newTab(props.artist.learnMore)} className="btn-red-outline artist-buttton-absolute transition">See More Work</span>}
                </div>
            </div>
        </React.Fragment>
    );
}

export default ArtistWrapper;