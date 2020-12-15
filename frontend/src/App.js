import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Switch, Route, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { BrowserRouter as Router } from "react-router-dom";
import { Credentials } from "./credentials/Index";
import { BucketBrowser } from "./browse/BucketBrowser";
import { Home } from "./home/Home";

function App() {
  return (
    <Router>
    <Container fluid={true} className="p-0">
      <Navbar bg="primary" variant="dark" expand="lg" className="App-header vh-5" sticky="top">
        <Navbar.Brand as="div">
          <Link to="/browse">Browse Buckets</Link>
        </Navbar.Brand>
        <Nav.Link as="div">
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
      <Navbar bg="secondary" variant="light" className="App-footer vh-5" sticky="bottom" expand="false">
        <Nav.Link as="div">
          <Link to="https://github.com/nicoandra/s3-browser">Source code</Link>
        </Nav.Link>
      </Navbar>
    </Container>
    </Router>

    
  );
}

export default App;
