import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { upsertFAQ, getFaqs, getFAQ } from './Faq.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Form, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


const Faq = (props) => {
    const [submissionType, setSubmissionType] = useState(1)
    const [faq, setFaq] = useState({})
    const [ckAnswer, setCkAnswer] = useState()
    const [loader, setLoader] = useState(false)
    const { faqId } = useParams();
    const [error, setError] = useState({})

    useEffect(() => {
        let data = faq
        data["answer"] = ckAnswer
        setFaq({ ...data })

    }, [ckAnswer])

    useEffect(() => {
        window.scroll(0, 0)
        if (faqId) {
            props.getFAQ(faqId)
        }
    }, [])

    useEffect(() => {
        if (faqId) {
            setFaq({ question: props?.faq?.question, answer: props?.faq?.answer, _id: props?.faq?._id })
            setSubmissionType(2)
        }
    }, [props.faq])

    const onChange = (e) => {
        let { name, value } = e.target
        let data = faq
        data[name] = value
        setFaq({ ...data })

    }

    const validation = () => {
        let err = {}
        let isValid = true

        if (!faq.question) {
            err["question"] = "Question is Required."
            isValid = false
        }
        if (!faq.answer) {
            err["answer"] = "Answer is Required."
        }

        setError(err)
        return isValid
    }

    const submit = async () => {
        if (validation()) {
            if (faq.question && faq.answer) {
                setLoader(true)
                props.upsertFAQ(`faq/${submissionType === 1 ? 'create' : 'edit'}`, faq, submissionType === 1 ? 'POST' : 'PUT')
            }
        }
    }

    useEffect(() => {
        if (props?.faq?.success) {
            setLoader(false)
            props.history.push("/faqs")
        } else {
            setLoader(false)
        }
    }, [props.faq])

    return (

        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Form>
                            <Form.Group>
                                <label className="text-white">Question<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter name"
                                    type="text"
                                    name="question"
                                    onKeyUp={(e) => onChange(e)}
                                    defaultValue={faq?.question}
                                    required
                                />
                                {error["question"] && <p className="error">{error.question}</p>}
                            </Form.Group>
                            <Form.Group>
                                <label className="text-white">Answer<span className="text-danger">*</span></label>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={faq?.answer}
                                    onChange={(event, editor) => {
                                        setCkAnswer(editor.getData())
                                    }}
                                />
                                {error["answer"] && <p className="error">{error.answer}</p>}
                            </Form.Group>
                            <div className="about-bt modal-footer">
                                <Button
                                    className="btn btn-close"
                                    onClick={() => props.history.push("/faqs")}
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
    faq: state.faqs?.faq,
    faqs: state.faqs,
    error: state.error
});

export default connect(mapStateToProps, { upsertFAQ, getFaqs, getFAQ })(Faq);