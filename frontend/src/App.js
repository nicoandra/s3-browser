import './App.css';
import {Credentials} from './credentials/Index'
import {List} from './browse/List'
import {BrowseBucket} from './browse/BrowseBucket'

import {
  Switch,
  Route,
  Link
} from "react-router-dom";


function App() {
  return (
      <div className="App">
        <header className="App-header">
          <Link to="/">S3 Browser</Link>
        </header>
        <nav>
          <ul>
            <li><Link to="/credentials">Set Credentials</Link></li>
            <li><Link to="/browse">Browse Buckets</Link></li>
          </ul>
        </nav>
        <main className="App-main">
          <Switch>
            <Route exact path="/" render={()=>{ return "Thanks for setting this up"}} />
            <Route exact path="/credentials" component={Credentials} />
            <Route exact path="/browse" component={List} />
            <Route path="/browse/:bucketName/:prefixes?" component={BrowseBucket} />
          </Switch>
        </main>
        <footer className="App-footer">
          <div><a href="https://github.com/nicoandra/s3browser/">Source</a></div>
        </footer>
      </div>
  );
}

export default App;
