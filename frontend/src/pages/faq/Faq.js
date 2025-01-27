import React, { useState, useEffect } from 'react';
import { Accordion } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFaqs } from './Faq.action';
import './faq.css'
import Loader from '../../components/loader/loader'

const Faq = (props) =>  {

    const [loader, setLoader] = useState(true)
    const [error, setError] = useState(false)

    useEffect(()=> {
        props.getFaqs()
    },[])

    useEffect(()=> {
        if(props.getFaqAuth){
            setLoader(false)
            if(props.faqs.length){

            }else {
                setError(true)
            }
        }
    }, [props.getFaqAuth])

    return (
        <section className="faq-area">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-7">
                        {/* Intro */}
                        <div className="intro text-center">
                            <h3 className="mt-3 mb-4 red-color">Frequently Asked Questions</h3>
                        </div>
                    </div>
                </div>
                {
                    loader &&  
                    <Loader  />
                }
                {
                    error && !loader ? <div className="empty-box"><p>There is no FAQ exists.</p></div> : ''
                }
                <Accordion>
                    {props?.faqs?.map((faq, idx) => {
                        return (
                            <Accordion.Item eventKey={idx}>
                                <Accordion.Header>{faq?.question}</Accordion.Header>
                                <Accordion.Body>
                                    <div className="card-body py-3" dangerouslySetInnerHTML={{ __html: faq?.answer }}></div>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion> 
            </div>
        </section>
    )
}

const mapStateToProps = state => ({
    faqs: state.faq.faqs,
    getFaqAuth: state.faq.getFaqAuth
})

export default connect(mapStateToProps, { getFaqs })(Faq);