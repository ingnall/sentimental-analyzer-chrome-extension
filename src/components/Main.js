/* eslint-disable no-undef */
import { Doughnut } from 'react-chartjs-2';
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card
} from "react-bootstrap";

import "../assets/css/Main.css";

const Main = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyze, setAnalyze] = useState(false);
    const [postUrl, setPostUrl] = useState('');
    const [positive, setPositive] = useState(0.3333);
    const [neutral, setNeutral] = useState(0.3333);
    const [negative, setNegative] = useState(0.3333);

    useEffect(() => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            var URL = tabs[0].url;
            if (URL.includes('https://m.facebook.com/')) {
                setPostUrl(URL);
                handleAnalyze(URL);
            }
            else if (URL.includes('https://www.facebook.com/')) {
                URL = URL.replace('www.', 'm.');
                setPostUrl(URL);
                handleAnalyze(URL);
            } else {
                setError('This is not a Facebook page');
            }
        });

        // var URL = window.location.href;
        // if (URL.includes('https://m.facebook.com/')) {
        //     setPostUrl(URL);
        //     handleAnalyze(URL);
        // }
        // else if (URL.includes('https://www.facebook.com/')) {
        //     URL = URL.replace('www.', 'm.');
        //     setPostUrl(URL);
        //     handleAnalyze(URL);
        // } else {
        //     setError('This is not a Facebook page');
        // }
    }, []);

    const handleAnalyze = (postUrl) => {
        console.log(postUrl);
        if (postUrl) {
            setError('');
            setLoading(true);
            setAnalyze(true);

            axios.post(`http://localhost:8000/?data=${postUrl}`)
                .then((djangoRes) => {
                    console.log(djangoRes);
                    const objects = Object.values(djangoRes.data);
                    const array = Object.keys(djangoRes.data).map((key, index) => (
                        { name: key, object: objects[index] }
                    ));
                    console.log(array);
                    if (!array.length) {
                        setError('URL is not correct OR post does not have any comment');
                        setLoading(false);
                    } else {
                        const totalComments = array.length;
                        let sumPositive = 0;
                        let sumNeutral = 0;
                        let sumNegative = 0;
                        for (let i = 0; i < array.length; i++) {
                            sumPositive += array[i].object.pos;
                            sumNeutral += array[i].object.neu;
                            sumNegative += array[i].object.neg;
                        }
                        setPositive(sumPositive / totalComments);
                        setNeutral(sumNeutral / totalComments);
                        setNegative(sumNegative / totalComments);
                        setLoading(false);
                        setAnalyze(false);
                    }
                })
                .catch((err) => {
                    console.log(err.response);
                    setError('Server error');
                    setLoading(false);
                    setAnalyze(false);
                });
        }
    };

    const moreResult = () => {
        navigator.clipboard.writeText(postUrl);
        chrome.tabs.getCurrent(function (tab) {
            var URL = "https://localhost:3000/app/analyzer";

            chrome.tabs.create({ "url": URL });
        });

        // window.location.href = "https://localhost:3000/app/analyzer";
    }

    const data = {
        datasets: [
            {
                data: [(positive * 100).toFixed(2), (negative * 100).toFixed(2), (neutral * 100).toFixed(2)],
                backgroundColor: [
                    '#43a047',
                    '#e53935',
                    '#fb8c00'
                ],
                borderWidth: 5,
                borderColor: '#fff',
                hoverBorderColor: '#fff'
            }
        ],
        labels: ['Positive', 'Negative', 'Neutral']
    };

    const options = {
        animation: true,
        cutoutPercentage: 80,
        layout: { padding: 0 },
        legend: {
            display: false
        },
        maintainAspectRatio: false,
        responsive: true,
        tooltips: {
            backgroundColor: '#fff',
            bodyFontColor: '#6b778c',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            borderWidth: 1,
            enabled: true,
            footerFontColor: '#6b778c',
            intersect: false,
            mode: 'index',
            titleFontColor: '#172b4d'
        }
    };

    return (
        <>
            <div
                className="svg-loader"
                style={{
                    display: loading ? 'flex' : 'none'
                }}
            >
                <div>
                    <div style={{
                        textAlign: 'center',
                        fontFamily: 'system-ui',
                        fontSize: '20px',
                        color: '#273854'
                    }}
                    >
                        Please wait
                    </div>
                    <div style={{ marginTop: '5px' }}>
                        <svg className="svg-containerr" height="140" width="140" viewBox="-2 -2 105 105">
                            <circle className="loader-svg bg" cx="50" cy="50" r="45" />
                            <circle className="loader-svg animate" cx="50" cy="50" r="45" />
                        </svg>
                    </div>
                </div>
            </div>

            <Container style={{ display: !loading && !analyze && !error.length ? 'block' : 'none' }}>
                <Card>
                    <Row>
                        <Col>
                            <h2>Satisfaction</h2>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={8}>
                            <Doughnut
                                data={data}
                                options={options}
                            />
                        </Col>
                        <Col xs={4}>
                            <Row>
                                <Col xs={2} style={{ padding: 0 }}>
                                    <div className="dot positive"></div>
                                </Col>
                                <Col xs={10} style={{ padding: 0 }}>
                                    <div className="percentage">{(positive * 100).toFixed(2)}%</div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={2} style={{ padding: 0 }}>
                                </Col>
                                <Col xs={10} style={{ padding: 0 }}>
                                    <div className="txt">Positive</div>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '10px' }}>
                                <Col xs={2} style={{ padding: 0 }}>
                                    <div className="dot neutral"></div>
                                </Col>
                                <Col xs={10} style={{ padding: 0 }}>
                                    <div className="percentage">{(neutral * 100).toFixed(2)}%</div>
                                </Col>
                            </Row>
                            <Row style={{ marginBottom: '10px' }}>
                                <Col xs={2} style={{ padding: 0 }}>
                                </Col>
                                <Col xs={10} style={{ padding: 0 }}>
                                    <div className="txt">Neutral</div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={2} style={{ padding: 0 }}>
                                    <div className="dot negative"></div>
                                </Col>
                                <Col xs={10} style={{ padding: 0 }}>
                                    <div className="percentage">{(negative * 100).toFixed(2)}%</div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={2} style={{ padding: 0 }}>
                                </Col>
                                <Col xs={10} style={{ padding: 0 }}>
                                    <div className="txt">Negative</div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row
                        className="view-more"
                        style={{
                            display: (!error && !loading && !analyze) ? 'block' : 'none'
                        }}
                    >
                        <Col style={{ padding: 0 }}>
                            <button onClick={moreResult}>View more</button>
                        </Col>
                    </Row>
                </Card>
            </Container>

            <div
                style={{
                    display: !loading && error.length ? 'block' : 'none',
                    textAlign: 'center',
                    marginTop: '15px'
                }}
            >
                {error}
            </div>

            <footer className="Main-footer" />
        </>
    );
};

export default Main;