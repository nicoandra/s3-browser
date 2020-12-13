import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { BucketList } from "./BucketList";
import { BucketContent } from "./BucketContent";

export function BucketBrowser(props) {
  const {
    bucketName: bucketNameParams,
    prefixes: currentPrefixesParams,
  } = useParams();
  const [activeBucketName, setActiveBucketName] = useState(bucketNameParams);

  function bucketSelectionHandler(bucketName) {
    setActiveBucketName(bucketName);
  }

  return (
    <Row>
            <BucketList
              baseUri="browse-2"
              onBucketSelectionChange={bucketSelectionHandler}
              className="col-md-1"
            />

            <BucketContent
              baseUri="browse-2"
              bucketName={activeBucketName}
              prefixes={currentPrefixesParams}
              className="col-xl-10"
            />
    </Row>
  );
}
