import React, { useEffect, useState, useCallback } from "react";
import { get, getStream } from "./../common";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  BsCloudDownload,
  BsFolder,
  BsFileEarmarkCheck,
  BsEye,
  BsCalendar,
} from "react-icons/bs";
import {
  Row,
  Col,
  Navbar,
  Nav,
  Table,
  Breadcrumb,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import * as QueryString from "query-string";

export function BucketContent(props) {
  const {
    bucketName: bucketNameParams,
    prefixes: currentPrefixesParams,
  } = useParams();
  const { search } = useLocation();
  const [contents, setContents] = useState([]);
  const [grepText, setGrepText] = useState("");
  const [filterText, setFilterText] = useState("");
  const [prefixes, setPrefixes] = useState([]);
  const [currentPrefixes, setCurrentPrefixes] = useState(
    currentPrefixesParams || ""
  );
  const [bucketName, setBucketName] = useState(bucketNameParams || '');
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

  const memoizedFetchContent = useCallback(
    (continuationToken) => {


      if(!bucketName) {
        return ;
      }

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

      fetchContent(continuationToken);
    },
    [currentPrefixes, bucketName]
  );

  useEffect(() => {
    const parsed = QueryString.parse(search);
    setContinuationTokenFromQuery(parsed.continuationToken);
  }, [search]);

  useEffect(() => {
    setBucketName(bucketNameParams);
    setCurrentPrefixes("");
    setFilterText("");
    setGrepText("");
  }, [bucketNameParams]);

  useEffect(() => {
    memoizedFetchContent(continuationTokenFromQuery);
  }, [continuationTokenFromQuery, memoizedFetchContent]);

  useEffect(() => {
    if (bucketName === undefined) {
      return;
    }
    memoizedFetchContent("");
  }, [currentPrefixes, bucketName, memoizedFetchContent]);


  const classNames = [props.className, 'bucket-content'].join(' ')

  if (bucketName === undefined || !ready) {
    const content = bucketName === undefined ? <span class="align-middle">Pick a bucket</span> : <Spinner animation="border" variant="primary" />
    return (<Row className={classNames}>
          <Col>
            {content}
          </Col>
      </Row>);
  }

  const backLink = (
    <BackLink
      onClick={(evt) => removeLastPrefix()}
      currentPrefixes={currentPrefixes}
      bucketName={bucketName}
      baseUri={baseUri}
    />
  );

  return (
    <Row className={classNames}>
      <Col>
        <Row>
          <Col>
            <BrowseBucketHeader
              bucketName={bucketName}
              currentPrefixes={currentPrefixes}
              onCurrentPrefixChange={(prefixes) => setCurrentPrefixes(prefixes)}
              baseUri={baseUri}
              continuationToken={continuationTokenFromResponse}
              onGrepTextChange={(text) => {
                setGrepText(text);
              }}
              onFilterTextChange={(text) => {
                setFilterText(text);
              }}
            />
          </Col>
        </Row>
        <Row>
          <Table className="table-striped table-md">
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

              {prefixes
                .filter((prefix) => {
                  if (!filterText.length) return true;
                  return prefix.includes(filterText);
                })
                .map((prefix) => (
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
                    <td>
                      <PrefixLink
                        bucketName={bucketName}
                        prefix={prefix}
                        currentPrefixes={currentPrefixes}
                        onClick={(evt) => {
                          addPrefix(prefix);
                        }}
                        baseUri={baseUri}
                        displayText={<BsFolder />}
                      />
                    </td>
                  </tr>
                ))}

              {contents
                .filter((row) => {
                  if (!filterText.length) return true;
                  return row.friendlyName.includes(filterText);
                })
                .map((row) => (
                  <tr>
                    <td>{row.friendlyName}</td>
                    <td>{row.lastUpdate}</td>
                    <td>{row.size}</td>
                    <td>
                      <DownloadLink
                        bucketName={bucketName}
                        objectKey={row.key}
                        friendlyName={row.friendlyName}
                      />{" "}
                      <PeekLink
                        bucketName={bucketName}
                        objectKey={row.key}
                        friendlyName={row.friendlyName}
                      />{" "}
                      <GrepDownloadLink
                        bucketName={bucketName}
                        objectKey={row.key}
                        friendlyName={row.friendlyName}
                        text={grepText}
                      />{" "}
                      <GrepDownloadLink
                        bucketName={bucketName}
                        objectKey={row.key}
                        friendlyName={row.friendlyName}
                        text={grepText}
                        historical={true}
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

  return (
    <Button onClick={download} title="Download this file">
      <BsCloudDownload />
    </Button>
  );
}

function GrepDownloadLink(props) {
  const historical = props.historical ? "history" : "";

  function download() {
    const path =
      [
        "",
        "s3",
        encodeURIComponent(props.bucketName),
        encodeURIComponent(props.objectKey),
        "grep",
        historical,
      ].join("/") +
      "?text=" +
      encodeURIComponent(props.text);
    getStream(path).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grep-${props.text}-${props.friendlyName}`;
      a.click();
    });
  }

  const icon = historical ? <BsCalendar /> : <BsFileEarmarkCheck />;
  const title = historical
    ? "Download all lines containing the Grep text through the latest versions of this file"
    : "Download all lines containing the Grep text";
  return (
    <Button
      disabled={props.text.length === 0}
      onClick={download}
      title={title}
    >
      {icon}
    </Button>
  );
}

function PeekLink(props) {
  function download() {
    const path = [
      "",
      "s3",
      encodeURIComponent(props.bucketName),
      encodeURIComponent(props.objectKey),
      "peek",
    ].join("/");
    getStream(path).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = props.friendlyName;
      a.click();
    });
  }

  return (
    <Button onClick={download} title="Download the first 256KB of this file">
      <BsEye />
    </Button>
  );
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
  const { bucketName, currentPrefixes, prefix, displayText } = props;
  const newPrefixes = currentPrefixes ? currentPrefixes.split("|") : [];
  newPrefixes.push(prefix);

  const display = displayText ? displayText : prefix.length ? prefix : "..";
  const uri =
    `/${props.baseUri}/` +
    bucketName +
    "/" +
    (currentPrefixes ? currentPrefixes + "|" : "") +
    (prefix.length ? prefix : "");
  return (
    <Link to={uri} onClick={props.onClick}>
      {display}
    </Link>
  );
}

export function BrowseBucketHeader(props) {
  const { bucketName, continuationToken } = props;
  const prefixes = props.currentPrefixes.split("|");

  const prefixButtons = [
    {
      link: ["", props.baseUri, bucketName].join("/"),
      text: bucketName,
      prefixes: "",
    },
  ]
    .concat(
      prefixes
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
    )
    .map((c, key) => {
      return (
        <Breadcrumb.Item key>
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

  const searchInListTextBox = (
    <Form.Control
      placeholder="Filter by name"
      onChange={(evt) => {
        props.onFilterTextChange(evt.target.value);
      }}
    />
  );
  const grepTextBox = (
    <Form.Control
      placeholder="Grep text"
      onChange={(evt) => {
        props.onGrepTextChange(evt.target.value);
      }}
    />
  );
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
      <Nav className="mr-auto">{prefixPath}</Nav>
      <Form inline>
        {searchInListTextBox}
        {grepTextBox}
      </Form>
      {nextPage}
    </Navbar>
  );
}
