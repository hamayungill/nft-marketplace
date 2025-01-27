import React, { useEffect , useState} from "react";
import { toast } from 'react-toastify';
// react component used to create charts
import ChartistGraph from "react-chartist";
// react components used to create a SVG / Vector map
import { VectorMap } from "react-jvectormap";
import { Link } from "react-router-dom";
import FullPageLoader from "components/FullPageLoader/FullPageLoader";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  Navbar,
  Nav,
  OverlayTrigger,
  Table,
  Tooltip,
  Container,
  Row,
  Col,
} from "react-bootstrap";

import { connect } from "react-redux";
import { getDashboardStats } from './Dashoboard.action';

const Dashboard = (props) => {
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    props.getDashboardStats()
  }, [])

  //getStats
  useEffect(()=>{
    if(props.dashboardStatsAuth){
      setLoader(false)
    }
  },[props.dashboardStatsAuth])

  return (
    <>
      {
        loader &&
          <FullPageLoader />
      }
      <Container fluid>
        <Row>
          {console.log("props.dashboardStats: ",props.dashboardStats)}
          <Col xl="3" sm="6">
            <Link to="/categories" >
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-bullet-list-67 text-primary"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Categories</p>
                        <Card.Title as="h4">{props.dashboardStats?.total_categories || 0}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xl="3" sm="6">
            <Link to="/artists" >
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-paint-brush"></i>
                        
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Artist</p>
                        <Card.Title as="h4">{props.dashboardStats?.total_artists || 0}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xl="3" sm="6">
            <Link to="/ingredients" >
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-cart-simple text-warning"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Ingredients</p>
                        <Card.Title as="h4">{props.dashboardStats?.total_ingredients || 0}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xl="3" sm="6">
            <Link to="/pizzas" >
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-chart-pie-36 text-success"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Pizzas</p>
                        <Card.Title as="h4">{props.dashboardStats?.total_pizzas || 0}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>
        <Row>
          <Col xl="3" sm="6">
            <Link to="/faqs" >
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fa fa-question-circle" aria-hidden="true"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">FAQ</p>
                        <Card.Title as="h4">{props.dashboardStats?.total_faqs || 0}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          {/* <Col xl="3" sm="6">
            <Link to="/artists" >
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-circle-09 text-danger"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">User</p>
                        <Card.Title as="h4">{props.dashboardStats?.total_artists || 0}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Link>
          </Col> */}
        </Row>
      </Container>
    </>
  );
}


const mapStateToProps = state => ({
  dashboardStats: state?.dashboard?.dashboardStats ,
  dashboardStatsAuth: state?.dashboard?.dashboardStatsAuth
});

export default connect(mapStateToProps, { getDashboardStats })(Dashboard);
