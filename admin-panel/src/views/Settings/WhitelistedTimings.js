import { useState, useEffect } from "react";
import $ from 'jquery';
import { getSettings, beforeSettings, editSettings } from './settings.action';
import { connect } from 'react-redux';
import validator from 'validator';
import { setwhitelistUserDateTime, whitelistUsers, updateAdminUser} from '../../utils/web3'
import {OutTable, ExcelRenderer} from 'react-excel-renderer';
import FullPageLoader from "components/FullPageLoader/FullPageLoader";
import moment from 'moment';

// react-bootstrap components
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";

const WhitelistedTimings = (props) => {
  const [data, setData] = useState({whitelistUserStartTime: '', whitelistUserEndTime: ''})
  const [whitelistedUsers, setWhitelistedUsers] = useState({})
  const [adminUserAddress, setAdminUserAddress] = useState()
  const [loader, setLoader] = useState(false)
  const [addressArr, setaddressArr] = useState([])
  const [error, setError] = useState([])
  const [errMsg, setErrMsg ] = useState()

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
  
  const save = async() => {
    setErrMsg('')
    setLoader(true)
    let startDate = new Date(data?.whitelistUserStartTime )
    let endDate = new Date(data?.whitelistUserEndTime )
    if(!startDate && !endDate){
      setErrMsg("Enter valid start and end date.")
      setLoader(false)
    }else if(startDate >= endDate){
      setErrMsg("End Date must be greater than the Start Date.")
      setLoader(false)
    }else {
      if(data?.whitelistUserStartTime && data?.whitelistUserEndTime){
        let sd =  Math.floor(new Date(startDate).getTime()/1000);
        let ed = Math.floor(new Date(endDate).getTime()/1000);

        const res = await setwhitelistUserDateTime(sd, ed)
        if(res){
          let formData = new FormData()
          for (const key in data)
            formData.append(key, data[key])
          props.editSettings(formData)
        }else {

        }
        setLoader(false)
      }
    }
  }

  const validation = () => {
    let err = {}
    let isValid = true
    
    if (!whitelistedUsers['fileUploaded']) {
        err["file"] = "File is Required."
        isValid = false
        
    }
    setError(err)
    return isValid
}


  const uploadWhitlistedUsers = async () => {
    setLoader(true)
    if (validation()) {
      const res = await whitelistUsers(addressArr)
      setLoader(false)
    }else {
      setLoader(false)
    }
  }

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj,(err, resp) => {
      if(err){
        console.log(err);            
      }
      else{
        if(fileObj){
          whitelistedUsers['fileUploaded'] = true
          $('#category-image-label').html('File selected')
        }
        let addrArr = []
        Promise.all(resp?.rows?.map((e)=> {
          if(e[0]){
            addrArr.push(e[0])
          }
        }))
        setaddressArr([...addrArr])
        console.log("addrArr = ",addrArr)
      }
    });               

  }

  const updateAdminUserFn = async() => {
    setLoader(true)
    const res = await updateAdminUser(adminUserAddress)
    setAdminUserAddress('')
    setLoader(false)
  }

  return (
    <>
    {
      loader && <FullPageLoader />
    }
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
                  <Card.Title as="h4">Whitelisted Users Time Period Settings</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Label>
                        Start TIme <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="datetime-local"
                          value={data?.whitelistUserStartTime}
                          min={moment().format("YYYY-MM-DDTHH:mm")}	
                          onChange={(e) => setData({ ...data, whitelistUserStartTime: e.target.value })}
                          required={true}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        End TIme <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="datetime-local"
                          value={data.whitelistUserEndTime}
                          min={data?.whitelistUserStartTime}
                          onChange={(e) => setData({ ...data, whitelistUserEndTime: e.target.value })}
                          required={true}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  {
                    errMsg &&
                    <p className="error">{errMsg}</p>
                  }
                </Card.Body>
                <Card.Footer className="text-center">
                  <div className="my-bt" style={{ textAlign: "left" }}>
                    <Button
                      variant="info"
                      className="yellow-button"
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
                  <Card.Title as="h4">Upload Users Addresses to be whitelisted</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                    <Form.Group className="mb-4">
                      <label className="text-white">Upload Addresses<span className="text-danger">*</span></label>
                        <div className="input-group form-group">
                            <div className="custom-file">
                                <input type="file" className="custom-file-input" id="category-image" accept=".xlsx,.csv" onChange={fileHandler} name="image" />
                                <label id="category-image-label" className="custom-file-label" >Choose file</label>
                            </div>
                        </div>
                        {error["file"] && <p className="error">{error.file}</p>}
                    </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer className="text-center">
                  <div className="my-bt" style={{ textAlign: "left" }}>
                    <Button
                      variant="info"
                      className="yellow-button"
                      onClick={uploadWhitlistedUsers}
                    >
                      Save Settings
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Form>
          </Col>
        </Row>
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
                  <Card.Title as="h4">Update Admin User</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                    <Form.Group className="mb-4">
                    <Form.Label>
                        Address <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="0x"
                          onChange={(e) => { setAdminUserAddress(e.target.value) }}
                          required="true"
                        ></Form.Control>
                      </Form.Group>
                    </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer className="text-center">
                  <div className="my-bt" style={{ textAlign: "left" }}>
                    <Button
                      variant="info"
                      className="yellow-button"
                      onClick={updateAdminUserFn}
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

export default connect(mapStateToProps, { getSettings, beforeSettings, editSettings })(WhitelistedTimings);
