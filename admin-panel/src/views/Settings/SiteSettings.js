import { useState, useEffect } from "react";

import { getSettings, beforeSettings, editSettings } from './settings.action';
import { connect } from 'react-redux';


// react-bootstrap components
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";

import validator from 'validator';


const SiteSettings = (props) => {

  useEffect(() => {
    window.scroll(0, 0)
    props.getSettings()
  }, [])

  useEffect(() => {
    if (props.settings.settingsAuth) {
      if (props.settings.settings) {
        setSettings(props.settings.settings)
      }
    }
  }, [props.settings.settingsAuth])

  const [settings, setSettings] = useState({
    email: '',
    mobile: '',
    phone: '',
    address: '',
    domain: '',
    api: ''
  })

  const [msg, setMsg] = useState({
    email: '',
    mobile: '',
    phone: '',
    address: '',
    domain: '',
    api: ''
  })

  const checkMailGunAPI = (domain , api)=>{
    //MailGun logic Left here
    return true
  }

  const submit = () => {
    if (validator.isEmail(settings.email) && validator.isNumeric(settings.mobile) &&
      validator.isNumeric(settings.phone) && !validator.isEmpty(settings.address) &&
      !validator.isEmpty(settings.domain) && !validator.isEmpty(settings.api)  && checkMailGunAPI(settings.domain , settings.api)) {
      setMsg({ email: '', mobile: '', phone: '', address: '', domain: '', api: '' })
      let formData = new FormData()
      for (const key in settings)
        formData.append(key, settings[key])
      props.editSettings(formData)
    }
    else {
      let email = ''
      let mobile = ''
      let phone = ''
      let address = ''
      let domain = ''
      let api = ''
      if (!validator.isEmail(settings.email)) {
        email = 'Email Address Required'
      }
      if (!validator.isNumeric(settings.mobile)) {
        mobile = 'Mobile No Required'
      }
      if (!validator.isNumeric(settings.phone)) {
        phone = 'Phone No Required'
      }
      if (validator.isEmpty(settings.address)) {
        address = 'Address Required'
      }
      if (validator.isEmpty(settings.domain)) {
        domain = 'Domain Required'
      }
      if (validator.isEmpty(settings.api)) {
        api = 'API KEY Required'
      }
      setMsg({ email, mobile, phone, address, domain, api })
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
                  <Card.Title as="h4">Site Settings</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Label>
                        Site Email <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="email@gmail.com"
                          value={settings.email}
                          onChange={(e) => { setSettings({ ...settings, email: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.email ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.email}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Mobile No <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="XXXX-XXXXXXX"
                          maxLength="11"
                          value={settings.mobile}
                          onChange={(e) => { setSettings({ ...settings, mobile: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.mobile ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.mobile}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Phone No <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="XXXX-XXXXXXX"
                          maxLength="11"
                          value={settings.phone}
                          onChange={(e) => { setSettings({ ...settings, phone: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.phone ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.phone}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* <Row>
                    <Form.Label column sm="2">
                      Mobile No <span className="text-danger"> *</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={settings.mobile}
                          onChange={(e) => { setSettings({ ...settings, mobile: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.mobile ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.mobile}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}

                  {/* <Row>
                    <Form.Label column sm="2">
                      Phone No <span className="text-danger"> *</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={settings.phone}
                          onChange={(e) => { setSettings({ ...settings, phone: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.phone ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.phone}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}

                  <Row>
                    <Col md={4}>
                      <Form.Label>
                        Address <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="House# , Street# and City"
                          value={settings.address}
                          onChange={(e) => { setSettings({ ...settings, address: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.address ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.address}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Mailgun Domain<span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="YOUR_DOMAIN_NAME"
                          value={settings.domain}
                          onChange={(e) => { setSettings({ ...settings, domain: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.domain ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.domain}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Mailgun Api-Key <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="YOUR_API_KEY"
                          value={settings.api}
                          onChange={(e) => { setSettings({ ...settings, api: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.api ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.api}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row>


                  {/* <Row>
                    <Form.Label column sm="2">
                      Mailgun Domain<span className="text-danger"> *</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={settings.domain}
                          onChange={(e) => { setSettings({ ...settings, domain: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.domain ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.domain}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}


                  {/* <Row>
                    <Form.Label column sm="2">
                      Mailgun Api-Key <span className="text-danger"> *</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={settings.api}
                          onChange={(e) => { setSettings({ ...settings, api: e.target.value }) }}
                        ></Form.Control>
                        <span className={msg.api ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.api}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}
                </Card.Body>
                <Card.Footer className="text-center">
                  <div className="my-bt" style={{textAlign: "left"}}>
                    <Button 
                      variant="info" onClick={submit}>
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

export default connect(mapStateToProps, { getSettings, beforeSettings, editSettings })(SiteSettings);
