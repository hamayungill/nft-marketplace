import { useState, useEffect } from "react";

import { getSettings, beforeSettings, editSettings } from './settings.action';
import { connect } from 'react-redux';

import validator from 'validator';

// react-bootstrap components
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";

const NftsSettings = (props) => {

  useEffect(() => {
    window.scroll(0, 0)
    props.getSettings()
  }, [])

  useEffect(() => {
    if (props.settings.settingsAuth) {
      if (props.settings.settings) {
        setData(props.settings.settings)
      }
    }
  }, [props.settings.settingsAuth])

  const [data, setData] = useState({
    royality: '',
    share: ''
  })

  const [msg, setMsg] = useState({
    royality: '',
    share: ''
  })

  const save = () => {
    if ( validator.isNumeric(data.royality) && validator.isNumeric(data.share) && parseInt(data.royality)<=100 && parseInt(data.share)<=100 && parseInt(data.royality)>0 && parseInt(data.share)>0 ) {
      console.log('typeof royality : ',typeof data.royality)
      console.log("validator.isNumeric(data.royality) : ",validator.isNumeric(data.royality))
      console.log('data.royality : ', data.royality)
      console.log('data.share : ',data.share)
      setMsg({ royality: '', share: '' })
      let formData = new FormData()
      for (const key in data)
        formData.append(key, data[key])
      props.editSettings(formData)
    }
    else {
      let royality = ''
      let share = ''
      if( parseInt(data.royality)   >= 101){
        royality = "Royality is must be less then or equal to 100" 
      }
      if( parseInt(data.royality)  <= 0){
        royality = "Royality is must be greater then 0"
      }
      if(parseInt(data.share) >= 101 ){
        share = " Share is must be less then or equal 100"
      }
      if(parseInt(data.share) <= 0){
        share = "Share is must be greater then 0"
      }
      if (!validator.isNumeric(data.royality)) {
        royality = "Number Is Required"
      }
      if (!validator.isNumeric(data.share)) {
        share = "Number Is Required"
      }
      setMsg({ royality, share })
    }
  }

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Form
              action=""
              className="form-horizontal"
              id="TypeValidation"
              method=""
            >
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Nfts Settings</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Label>
                        Royality % <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="number"
                          value={data.royality}
                          onChange={(e) => setData({ ...data, royality: e.target.value })}
                        ></Form.Control>
                        <span className={msg.royality ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.royality}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Platform Share <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="number"
                          value={data.share}
                          onChange={(e) => setData({ ...data, share: e.target.value })}
                        ></Form.Control>
                        <span className={msg.share ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.share}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row>


                  {/* <Row>
                    <Form.Label column sm="3">
                      Platform Share <span className="text-danger">*</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="number"
                          value={data.share}
                          onChange={(e) => setData({ ...data, share: e.target.value })}
                        ></Form.Control>
                        <span className={msg.share ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.share}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}

                </Card.Body>
                <Card.Footer className="text-center">
                  <div className="my-bt" style={{ textAlign: "left" }}>
                    <Button
                      variant="info"
                      onClick={save}
                    >
                      Save Settings
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Form>
          </Col>

        </Row>
      </Container>
    </>
  );
}

const mapStateToProps = state => ({
  settings: state.settings,
  error: state.error
});

export default connect(mapStateToProps, { getSettings, beforeSettings, editSettings })(NftsSettings);
