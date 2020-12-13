import React, { useEffect, useState  } from "react";
import { Link, useParams } from "react-router-dom";
import  {Row, Col} from 'react-bootstrap'
import {BucketList} from './BucketList'
import {BucketContent} from './BucketContent'
 
export function BucketBrowser(props) {
    const { bucketName: bucketNameParams, prefixes:currentPrefixesParams } = useParams()
    const [ activeBucketName, setActiveBucketName] = useState(bucketNameParams)

    function bucketSelectionHandler(bucketName) {
        setActiveBucketName(bucketName)
    }

    return (
    <Row><Col>
        <Row>
            <Col lg={3}><BucketList baseUri="browse-2" onBucketSelectionChange={bucketSelectionHandler}/></Col>
            <Col><BucketContent baseUri="browse-2" bucketName={activeBucketName} prefixes={currentPrefixesParams}/></Col>
        </Row>
    </Col></Row>)
}