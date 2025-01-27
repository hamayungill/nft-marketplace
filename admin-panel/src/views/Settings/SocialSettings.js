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

const SocialSettings = (props) => {

  const [links, setLinks] = useState({
    discord: '',
    twitter: '',
    openSea: '',
    lookSrare: '',
    youtube: ''
  })

  const [msg, setMsg] = useState({
    discord: '',
    twitter: '',
    openSea: '',
    lookSrare: '',
    youtube: ''
  })

  useEffect(() => {
    window.scroll(0, 0)
    props.getSettings()
  }, [])

  useEffect(() => {
    if (props.settings.settingsAuth) {
      if (props.settings.settings) {
        setLinks(props.settings.settings)
      }
    }
  }, [props.settings.settingsAuth])

  function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }
  const save = () => {
    
    if ( !validator.isEmpty(links.discord) && !validator.isEmpty(links.twitter) &&
      !validator.isEmpty(links.openSea) && !validator.isEmpty(links.lookSrare)  && validURL(links.discord) && validURL(links.twitter) 
      && validURL(links.openSea) && validURL(links.lookSrare) 
    ) {
      setMsg({ discord: '', twitter: '', openSea: '', lookSrare: '', youtube: '' })
      let formData = new FormData()
      for (const key in links)
        formData.append(key, links[key])
      props.editSettings(formData)


    }
    else {
      let discord = ''
      let twitter = ''
      let openSea = ''
      let lookSrare = ''
      let youtube = ''


      if (validator.isEmpty(links.discord)) {
        discord = 'Discord Link Required'
      }

      if (validator.isEmpty(links.twitter)) {
        twitter = 'Twitter Link Required'
      }

      if (validator.isEmpty(links.openSea)) {
        openSea = 'OpenSea Link Required'
      }

      if (validator.isEmpty(links.lookSrare)) {
        lookSrare = 'LookSrare Link Required'
      }



      if(!validator.isEmpty(links.discord) && !validURL(links.discord)){
        discord = "Enter a Valid URL"
      }
      if(!validator.isEmpty(links.twitter) &&  !validURL(links.twitter) ){
        twitter = 'Enter a Valid URL'
      }
      if(!validator.isEmpty(links.openSea) && !validURL(links.openSea)){
        openSea = 'Enter a Valid URL'
      }
      if(!validator.isEmpty(links.lookSrare) && !validURL(links.lookSrare)){
        lookSrare = 'Enter a Valid URL'
      }


      setMsg({ discord, twitter, openSea, lookSrare, youtube })
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
                  <Card.Title as="h4">Social Settings</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Label>
                        Discord <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder={"https://discord.com/"}
                          value={links.discord}
                          onChange={(e) => setLinks({ ...links, discord: e.target.value })}
                        ></Form.Control>
                        <span className={msg.discord ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.discord}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Twitter <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="https://twitter.com/"
                          value={links.twitter}
                          onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                        ></Form.Control>
                        <span className={msg.twitter ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.twitter}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                      Opensea Collection <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="https://opensea.io/"
                          value={links.openSea}
                          onChange={(e) => setLinks({ ...links, openSea: e.target.value })}
                        ></Form.Control>
                        <span className={msg.openSea ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.openSea}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row>


                  {/* <Row>
                    <Form.Label column sm="2">
                      Twitter <span className="text-danger">*</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={links.twitter}
                          onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                        ></Form.Control>
                        <span className={msg.twitter ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.twitter}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}

                  {/* <Row>
                    <Form.Label column sm="2">
                      Instagram <span className="text-danger">*</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={links.instagram}
                          onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                        ></Form.Control>
                        <span className={msg.instagram ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.instagram}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}


                  <Row>
                    <Col md={4}>
                      <Form.Label>
                      LooksRare Collection <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="https://looksrare.org/collections"
                          value={links.lookSrare}
                          onChange={(e) => setLinks({ ...links, lookSrare: e.target.value })}
                        ></Form.Control>
                        <span className={msg.lookSrare ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.lookSrare}</label>
                        </span>
                      </Form.Group>
                    </Col>
                    {/* <Col md={4}>
                      <Form.Label>
                        YouTube <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="https://www.youtube.com/"
                          value={links.youtube}
                          onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
                        ></Form.Control>
                        <span className={msg.youtube ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.youtube}</label>
                        </span>
                      </Form.Group>
                    </Col> */}
                  </Row>

                  {/* <Row>
                    <Form.Label column sm="2">
                      YouTube <span className="text-danger">*</span>
                    </Form.Label>
                    <Col sm="9">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={links.youtube}
                          onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
                        ></Form.Control>
                        <span className={msg.youtube ? `` : `d-none`}>
                          <label className="pl-1 pt-0 text-danger">{msg.youtube}</label>
                        </span>
                      </Form.Group>
                    </Col>
                  </Row> */}




                </Card.Body>
                <Card.Footer className="text-center">
                  <div className="my-bt" style={{textAlign: "left"}}>
                  <Button
                    variant="info" className="yellow-button"
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

export default connect(mapStateToProps, { getSettings, beforeSettings, editSettings })(SocialSettings);
