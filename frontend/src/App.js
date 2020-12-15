import "./App.css";
import { Credentials } from "./credentials/Index";
import { BucketBrowser } from "./browse/BucketBrowser";
import { Home } from "./home/Home";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";

import "bootstrap/dist/css/bootstrap.min.css";

import { Switch, Route, Link } from "react-router-dom";

function App() {
  return (
    <Container fluid={true}>
      <Navbar bg="primary" variant="dark" expand="lg" className="App-header vh-5">
        <Navbar.Brand>
          <Link to="/browse">Browse Buckets</Link>
        </Navbar.Brand>
        <Nav.Link>
          <Link to="/credentials">Set Credentials</Link>
        </Nav.Link>
      </Navbar>

      <Container fluid={true} className="vh-90" as="main">
        <Switch>
          <Route
            exact
            path="/"
            component={Home}
          />
          <Route exact path="/credentials" component={Credentials} />
          <Route
            path="/browse/:bucketName/:prefixes?"
            component={BucketBrowser}
          />
          <Route exact path="/browse" component={BucketBrowser} />
        </Switch>
      </Container>

      <Row as="footer" className="footer vh-5">
        <Container>
          <a href="https://github.com/nicoandra/s3browser/">Source</a>
        </Container>
      </Row>
    </Container>
  );
}

export default App;
