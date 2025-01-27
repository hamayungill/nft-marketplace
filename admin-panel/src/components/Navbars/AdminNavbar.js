import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Button,
  Dropdown,
  Form,
  Navbar,
  Nav,
  Container
} from "react-bootstrap";
import { beforeAdmin } from '../../views/Admin/Admin.action';
import {connect } from 'react-redux'
import {ENV} from '../../config/config'
import {setAdmin} from '../../views/Admin/Admin.action'

function AdminNavbar(props) {
  const [collapseOpen, setCollapseOpen] = React.useState(false);

  useEffect(()=>{
    if (ENV.getUserKeys("loginAdminAuth")) {
			const userData = ENV.getUserKeys()
      console.log("userData", userData)
      if(!userData.loginAdminAuth){
        props.history.push('/')
      }
			props.setAdmin(userData)
		}
  },[])

  // useEffect(()=> {
  //   if(props.admin.loginAdminAuth){
  //     console.log("hiiii = ", props.admin.loginAdminAuth)
  //     // props.history.push('/')

  //   }
  // },[props.admin.loginAdminAuth])

  return (
    <>
      <Navbar expand="lg">
        <Container fluid className="navbar-container">
          <div className="position-relative">
          <div className="navbar-wrapper">
            <div className="navbar-minimize">
              <Button
                className="btn-fill btn-round btn-icon d-none d-lg-block bg-dark border-dark"
                variant="dark"
                onClick={() => document.body.classList.toggle("sidebar-mini")}
              >
                <i className="fas fa-ellipsis-v visible-on-sidebar-regular"></i>
                <i className="fas fa-bars visible-on-sidebar-mini"></i>
              </Button>
              <Button
                className="btn-fill btn-round btn-icon d-block d-lg-none bg-dark border-dark"
                variant="dark"
                onClick={() => {
                  document.documentElement.classList.toggle("nav-open");
                  document.getElementById("bodyClickWrapper").innerHTML = `<div id='fullScreenWrapper' onclick='document.documentElement.classList.toggle("nav-open")'></div>`;
                }
                }
              >
                <i className="fas fa-ellipsis-v visible-on-sidebar-regular"></i>
                <i className="fas fa-bars visible-on-sidebar-mini"></i>
              </Button>
            </div>
          </div>
          </div>
          <button
            className="navbar-toggler navbar-toggler-right border-0"
            type="button"
            onClick={() => setCollapseOpen(!collapseOpen)}
          >
            <span className="navbar-toggler-bar burger-lines"></span>
            <span className="navbar-toggler-bar burger-lines"></span>
            <span className="navbar-toggler-bar burger-lines"></span>
          </button>
          <Navbar.Collapse className="justify-content-end show" in={collapseOpen}>
            <Nav className="nav mr-auto" navbar>
              <Form
                className="navbar-form navbar-left navbar-search-form ml-3 ml-lg-0"
                role="search"
              >
              </Form>
            </Nav>
            <Nav navbar>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle
                  as={Nav.Link}
                  id="dropdown-41471887333"
                  variant="default"
                >
                  <i className="nc-icon nc-bullet-list-67"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  alignRight
                  aria-labelledby="navbarDropdownMenuLink"
                >
                  <Dropdown.Item
                    href="/admin/profile"
                    onClick={(e) => e.preventDefault()}
                  >
                    <NavLink to="/profile">
                      <div>
                        <i className="nc-icon nc-settings-90"></i>
                        Profile
                      </div>
                    </NavLink>
                  </Dropdown.Item>
                  <div className="divider"></div>
                  <Dropdown.Item
                    href="/login"
                    onClick={(e) => {e.preventDefault(); props.beforeAdmin(); localStorage.clear()}}
                  >
                    <NavLink to = "">
                      <div>
                        <i className="nc-icon nc-button-power"></i>
                        Log out
                      </div>
                    </NavLink>
                  </Dropdown.Item>

                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

const mapStateToProps = state => ({
  admin: state.admin,
  error: state.error
});

export default connect(mapStateToProps,{beforeAdmin, setAdmin})(AdminNavbar);
