import React from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Form,
  InputGroup,
  Navbar,
  Nav,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import {ENV} from '../../config/config'

function AdminFooter() {
  return (
    <>
      <footer className="footer">
        <Container fluid className="pl-4 ml-2">
          <nav>
            <p className="copyright text-right">
              © {new Date().getFullYear()}<script></script>
              <a href="" style={{ marginLeft: "5px", color: "#FD0D1B" }}>{ENV.appName}</a>
            </p>
          </nav>
        </Container>
      </footer>
    </>
  );
}

export default AdminFooter;
