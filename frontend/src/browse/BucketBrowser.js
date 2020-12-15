import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Row } from "react-bootstrap";
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
    <Row className="h-100">
      <BucketList
        onBucketSelectionChange={bucketSelectionHandler}
      />
      <BucketContent
        bucketName={activeBucketName}
        prefixes={currentPrefixesParams}
      />
    </Row>
  );
}
