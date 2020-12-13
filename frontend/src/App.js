import './App.css';
import {Credentials} from './credentials/Index'
import {List} from './browse/List'
import {BrowseBucket} from './browse/BrowseBucket'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'

import 'bootstrap/dist/css/bootstrap.min.css';

import {
  Switch,
  Route,
  Link
} from "react-router-dom";


function App() {
  return (
      <Container className="App">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand><Link to="/browse">Browse Buckets</Link></Navbar.Brand>
          <Nav.Link><Link to="/credentials">Set Credentials</Link></Nav.Link>
          <Nav.Link><Link to="/">S3 Browser</Link></Nav.Link>
        </Navbar>

        <Row className="h-75">
          <Switch>
              <Route exact path="/" render={()=>{ return "Thanks for setting this up"}} />
              <Route exact path="/credentials" component={Credentials} />
              <Route exact path="/browse" component={List} />
              <Route path="/browse/:bucketName/:prefixes?" component={BrowseBucket} />
            </Switch>
        </Row>

        <Row as="footer">
          <div><a href="https://github.com/nicoandra/s3browser/">Source</a></div>
        </Row>
      </Container>
  );
}

export default App;
