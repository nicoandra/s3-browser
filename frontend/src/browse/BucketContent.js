import React, { useEffect, useState } from "react";
import { get, getStream } from "./../common";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Navbar,
  Badge,
  Nav,
  Table,
  Breadcrumb,
  Spinner,
  Container,
} from "react-bootstrap";
import * as QueryString from "query-string";

export function BucketContent(props) {
  const params = useParams();
  const {
    bucketName: bucketNameParams,
    prefixes: currentPrefixesParams,
  } = useParams();
  const { search } = useLocation();
  const [contents, setContents] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [currentPrefixes, setCurrentPrefixes] = useState(
    currentPrefixesParams || ""
  );
  const [bucketName, setBucketName] = useState(bucketNameParams);
  const [
    continuationTokenFromResponse,
    setContinuationTokenFromResponse,
  ] = useState();
  const [
    continuationTokenFromQuery,
    setContinuationTokenFromQuery,
  ] = useState();
  const baseUri = props.baseUri || "browse";
  const [ready, setReady] = useState(false);

  const fetchContent = (continuationToken) => {
    setReady(false);
    let prefixesUri = currentPrefixes?.split("/").join("|");
    prefixesUri = prefixesUri ? "/" + prefixesUri : "";
    const continuationTokenUri = continuationToken
      ? `continuationToken=${encodeURIComponent(continuationToken)}&`
      : "";
    get(`/s3/${bucketName}${prefixesUri}?${continuationTokenUri}`).then(
      (res) => {
        setContents(res.contents);
        setPrefixes(res.prefixes);
        setContinuationTokenFromResponse(res.continuationToken);
        setReady(true);
      }
    );
  };

  useEffect(() => {
    const parsed = QueryString.parse(search);
    setContinuationTokenFromQuery(parsed.continuationToken);
  }, [search]);

  useEffect(() => {
    setBucketName(bucketNameParams);
    setCurrentPrefixes("");
  }, [bucketNameParams]);

  useEffect(() => {
    fetchContent(continuationTokenFromQuery);
  }, [continuationTokenFromQuery]);

  useEffect(() => {
    if (bucketName === undefined) {
      return;
    }
    fetchContent("");
  }, [currentPrefixes, bucketName]);

  if (bucketName === undefined) {
    return <div>Pick a bucket</div>;
  }

  const backLink = (
    <BackLink
      onClick={(evt) => removeLastPrefix()}
      currentPrefixes={currentPrefixes}
      bucketName={bucketName}
      baseUri={baseUri}
    />
  );

  if (!ready) {
    return (
      <Row className={props.className}>
        <Col>
          <Spinner animation="border" variant="primary" />
        </Col>
      </Row>
    );
  }

  return (
    <Row className={props.className}>
      <Col>
        <Row>
          <Col>
            <BrowseBucketHeader
              bucketName={bucketName}
              currentPrefixes={currentPrefixes}
              itemCount={contents.length}
              onCurrentPrefixChange={(prefixes) => setCurrentPrefixes(prefixes)}
              baseUri={baseUri}
              continuationToken={continuationTokenFromResponse}
            />
          </Col>
        </Row>
        <Row>
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Last Update</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backLink ? (
                <tr>
                  <td>{backLink}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ) : (
                ""
              )}

              {prefixes.map((prefix) => (
                <tr>
                  <td>
                    <PrefixLink
                      bucketName={bucketName}
                      prefix={prefix}
                      currentPrefixes={currentPrefixes}
                      onClick={(evt) => {
                        addPrefix(prefix);
                      }}
                      baseUri={baseUri}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}

              {contents.map((row) => (
                <tr>
                  <td>{row.friendlyName}</td>
                  <td>{row.lastUpdate}</td>
                  <td>{row.size}</td>
                  <td>
                    <DownloadLink
                      bucketName={bucketName}
                      objectKey={row.key}
                      friendlyName="Download"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
      </Col>
    </Row>
  );

  function removeLastPrefix() {
    const prefixes = currentPrefixes.split("|");
    setCurrentPrefixes(
      prefixes
        .slice(0, -1)
        .filter((s) => s.length)
        .join("|")
    );
  }

  function addPrefix(prefix) {
    const prefixes = currentPrefixes.split("|");
    prefixes.push(prefix.replace(/\//g, ""));
    setCurrentPrefixes(prefixes.filter((s) => s.length).join("|"));
  }
}

function DownloadLink(props) {
  function download() {
    const path = [
      "",
      "s3",
      encodeURIComponent(props.bucketName),
      encodeURIComponent(props.objectKey),
      "download",
    ].join("/");
    getStream(path).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = props.friendlyName;
      a.click();
    });
  }

  return <button onClick={download}>{props.friendlyName}</button>;
}

function BackLink(props) {
  const { bucketName, currentPrefixes } = props;
  let prefixes = currentPrefixes ? currentPrefixes.split("|") : [];

  if (prefixes.length === 0) return false;

  prefixes = prefixes.slice(0, -1).join("|");

  const uri =
    `/${props.baseUri}/` + bucketName + "/" + (prefixes ? prefixes : "");
  return (
    <Link to={uri} onClick={props.onClick}>
      ..
    </Link>
  );
}

function PrefixLink(props) {
  const { bucketName, currentPrefixes, prefix } = props;
  const newPrefixes = currentPrefixes ? currentPrefixes.split("|") : [];
  newPrefixes.push(prefix);

  const uri =
    `/${props.baseUri}/` +
    bucketName +
    "/" +
    (currentPrefixes ? currentPrefixes + "|" : "") +
    (prefix.length ? prefix : "");
  return (
    <Link to={uri} onClick={props.onClick}>
      {prefix.length ? prefix : ".."}
    </Link>
  );
}

export function BrowseBucketHeader(props) {
  const { bucketName, itemCount, continuationToken } = props;
  const prefixes = props.currentPrefixes.split("|");

  const prefixButtons = prefixes
    .map((v, i, arr) => {
      return arr.filter((_v, _i) => _i <= i);
    })
    .map((c) => {
      const prefixes = c.join("|");
      return {
        link: ["", props.baseUri, bucketName, prefixes].join("/"),
        text: c.slice(-1).pop(),
        prefixes,
      };
    })
    .map((c) => {
      return (
        <Breadcrumb.Item>
          <Link
            to={c.link}
            onClick={() => {
              props.onCurrentPrefixChange(c.prefixes);
            }}
          >
            {c.text}
          </Link>
        </Breadcrumb.Item>
      );
    });

  const prefixPath = <Breadcrumb>{prefixButtons}</Breadcrumb>;
  const nextPage = continuationToken === "" || (
    <Link
      to={
        ["", props.baseUri, bucketName, prefixes].join("/") +
        "?continuationToken=" +
        encodeURIComponent(continuationToken)
      }
    >
      Next
    </Link>
  );

  return (
    <Navbar>
      <Nav className="mr-auto">
        <Navbar.Brand>{bucketName}</Navbar.Brand>
        {prefixPath}
        <Badge>{itemCount} items</Badge>
      </Nav>
      {nextPage}
    </Navbar>
  );
}
