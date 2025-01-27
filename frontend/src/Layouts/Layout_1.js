import React, { useEffect } from 'react';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import ScrollToTop from '../components/scrollToTop/scrollToTop';
import { connect } from 'react-redux';

const Layout1 = (props) => {
    const { children } = props
    return (
        <>
            {
                props?.walletError !== "" ?
                    <div className="warning-section">
                        <div className="warning-text">
                            {props?.walletError}
                        </div>
                    </div>
                    : ''
            }
            <ScrollToTop />
            <div className="main">
                <Header />
                <div>
                    {children}
                </div>
                <Footer />
            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        walletError: state.wallet?.walletError
    }
}
export default connect(mapStateToProps, {})(Layout1);