import React, { useEffect, useState } from "react";
import { get } from "./../common";
import { Link } from "react-router-dom";
import { Row, Col, Table, Container, Spinner } from "react-bootstrap";

export function BucketList(props) {
  const [bucketList, setBucketList] = useState([]);
  const baseUri = props.baseUri || "browse";
  const onBucketSelectionChange =
    props.onBucketSelectionChange || function (bucketName) {};
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    get("/s3").then((res) => {
      console.log(res);
      setBucketList(res);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <Container className="align-middle">
        <Row>
          <Col>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Row>
      <Col>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {bucketList.map((bucket) => (
              <tr>
                <td>
                  <Link
                    to={`/${baseUri}/${bucket.name}`}
                    onClick={() => onBucketSelectionChange(bucket.name)}
                  >
                    {bucket.name}
                  </Link>
                </td>
                <td>{bucket.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}
