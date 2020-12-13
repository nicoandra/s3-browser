import "./App.css";
import { Credentials } from "./credentials/Index";
import { BucketList } from "./browse/BucketList";
import { BucketContent } from "./browse/BucketContent";
import { BucketBrowser } from "./browse/BucketBrowser";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";

import "bootstrap/dist/css/bootstrap.min.css";

import { Switch, Route, Link } from "react-router-dom";

function App() {
  return (
    <Container fluid={true}>
      <Navbar bg="light" expand="lg" className="App-header">
        <Navbar.Brand>
          <Link to="/browse">Browse Buckets</Link>
        </Navbar.Brand>
        <Nav.Link>
          <Link to="/credentials">Set Credentials</Link>
        </Nav.Link>
        <Nav.Link>
          <Link to="/browse-2">S3 Browser</Link>
        </Nav.Link>
      </Navbar>

      
      <Container fluid={true} className="App-main">
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return "Thanks for setting this up";
            }}
          />
          <Route exact path="/credentials" component={Credentials} />
          <Route exact path="/browse" component={BucketList} />
          <Route
            path="/browse/:bucketName/:prefixes?"
            component={BucketContent}
          />

          <Route exact path="/browse-2" component={BucketBrowser} />
          <Route
            path="/browse-2/:bucketName/:prefixes?"
            component={BucketBrowser}
          />
        </Switch>
      </Container>

      <Row as="footer" className="App-footer">
        <div>
          <a href="https://github.com/nicoandra/s3browser/">Source</a>
        </div>
      </Row>
    </Container>
  );
}

export default App;
