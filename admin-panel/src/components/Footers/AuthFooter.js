import React from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Container,
  Col,
} from "react-bootstrap";

import {ENV} from '../../config/config'

function AuthFooter() {
  return (
    <>
      <footer className="footer position-absolute fixed-bottom">
        <Container>
          <nav>
            <p className="copyright text-center m-0">
              © {new Date().getFullYear()}{" "}
              <a href="">{ENV.appName}</a>, made with
              love for a better web
            </p>
          </nav>
        </Container>
      </footer>
    </>
  );
}

export default AuthFooter;
