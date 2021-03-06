import React, { useEffect, useState } from "react";
import { get } from "./../common";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Container,
  Spinner,
  Nav,
  Form,
  Alert,
} from "react-bootstrap";

export function BucketList(props) {
  const [bucketList, setBucketList] = useState([]);
  const baseUri = props.baseUri || "browse";
  const onBucketSelectionChange = function (bucketName) {
    props.onBucketSelectionChange && props.onBucketSelectionChange(bucketName);
  };
  const [ready, setReady] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [errorResponse, setErrorResponse] = useState(false);

  useEffect(() => {
    setReady(false);
    get("/s3")
      .then((res) => {
        setErrorResponse(false);
        setBucketList(res);
        setReady(true);
      })
      .catch((err) => {
        setErrorResponse(err);
      });
  }, []);

  if (errorResponse) {
    return (
      <Container>
        <Row>
          <Col>
            <Alert variant="danger">
              <h2 className="alert-heading">
                <b>{errorResponse.statusCode}:</b> {errorResponse.title}
              </h2>
              <p>{errorResponse.message}</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!ready) {
    return (
      <Container>
        <Row>
          <Col>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Nav
      className={
        "flex-column col-md-2 d-none d-md-block bg-light sidebar overflow-auto p-4"
      }
    >
      <Form>
        <Form.Control
          placeholder="Filter by name"
          onChange={(evt) => {
            setFilterText(evt.target.value);
          }}
        />
      </Form>

      {bucketList
        .filter((bucket) => {
          if (filterText.length === 0) return true;
          return bucket.name.includes(filterText);
        })
        .map((bucket, key) => (
          <Nav.Link key={key} as="span">
            <Link
              to={`/${baseUri}/${bucket.name}`}
              onClick={() => onBucketSelectionChange(bucket.name)}
            >
              {bucket.name}
            </Link>
          </Nav.Link>
        ))}
    </Nav>
  );
}
