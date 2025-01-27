import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteLogo from '../../assets/images/logo.svg';
import twitter from '../../assets/images/twitter-logo.svg'
import discord from '../../assets/images/discord-logo.svg'
import looksrare from '../../assets/images/looksrare-logo.png'
import opensea from '../../assets/images/opensea-logo.svg'
import './footer.css';
import {ENV} from '../../config/config'
import {getSettings} from '../../redux/Settings/Setting.action'
import {connect} from 'react-redux'

const Footer = (props) => {

    useEffect(()=> {
        props.getSettings()
    }, [])

	return (
		<footer id="footer" className="px-3 py-3 py-5 ff-press-start">
            <h3 className="fw-bold">Join Our Community</h3>
            <div className='d-sm-flex justify-content-between align-items-center mb-4'>
                <div>
                    <ul className="footer-nav list-unstyled m-0">
                        <li><Link className="position-relative transition d-inline-block align-top" to="/meet-artists">Meet Artists</Link></li>
                        <li><Link className="position-relative transition d-inline-block align-top" to="/faq">Faq</Link></li>
                        {/* <li><a className="position-relative transition d-inline-block align-top" href={`${ENV.openSea}`}  target="_blank" >OpenSea</a></li> */}
                    </ul>
                </div>
                <div className='d-flex flex-column align-items-center footer-icons-row'>
                    <strong className="footer-logo d-inline-block align-top">
                        <Link className="d-block" to="/">
                            <div id='footer-logo'>
                                <img src={siteLogo} alt="Site Logo" className='img-fluid' />
                            </div>
                        </Link>
                    </strong>
                    <div className="footer-social-icons">
                        <ul>
                            <li>
                                <a target="_blank"  href={props?.setting?.twitter}>
                                    <div className='footer-icons-img'>
                                        <img src={twitter} alt="twitter" className='img-fluid'/>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a target="_blank"  href={props?.setting?.discord}>
                                    <div className='footer-icons-img'>
                                        <img src={discord} alt="discord" className='img-fluid'/>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a target="_blank"  href={props?.setting?.lookSrare}>
                                    <div className='footer-icons-img'>
                                        <img src={looksrare} alt="looksrare" className='img-fluid'/>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a target="_blank"  href={props?.setting?.openSea}>
                                    <div className='footer-icons-img'>
                                        <img src={opensea} alt="opensea" className='img-fluid'/>
                                    </div>
                                </a>
                            </li>
                        </ul>   
                    </div>
                </div>
            </div>
            <p className="text-center text-white">Copyright {new Date().getFullYear()}</p>
		</footer>
	);
}

const mapStateToProps = state => ({
	setting : state?.setting?.setting
})

export default connect(mapStateToProps, {getSettings})(Footer);
