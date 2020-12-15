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
  Container
} from "react-bootstrap";
import * as QueryString from "query-string";

export function Home(props) {
    return (<Container className={"vh-100 d-flex align-items-center justify-content-center"}><Link to="/browse">Start browsing</Link></Container>)
}