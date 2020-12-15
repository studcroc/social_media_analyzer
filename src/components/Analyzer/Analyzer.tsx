import React from 'react';
import './Analyzer.css';

const Sentiment = require('sentiment');

class Analyzer extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            sentences: [],
            percentages: {
                positive: 0,
                negative: 0,
                neutral: 0
            },
            analyzed: false,
            isDataLoaded: false,
            videoId: '',
            pageToken: ''
        };
    }

    componentDidMount() {

    }

    getURL = () => {
        console.log('getURL() called');
        let URL = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=${this.state.videoId}&key=AIzaSyDr-mlxqURDeOk6By_6mhuBV6PthS-T_Eo`;
        if (this.state.pageToken === null) {
            return null;
        } else if (this.state.pageToken === '') {
            return URL;
        } else {
            URL = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=${this.state.videoId}&pageToken=${this.state.pageToken}&key=AIzaSyDr-mlxqURDeOk6By_6mhuBV6PthS-T_Eo`;
            return URL;
        }
    }

    fetchComments = () => {
        console.log('fetchComments() called');
        let url = this.getURL();
        if (url === null) {
            console.log(`Fetched ${this.state.sentences.length} Comments.`);
            this.analyzeComments();
            return;
        }

        fetch(url).then(res => res.json()).then(res => this.extractComments(res));
        console.log('fetchComments() returned');
    }

    extractComments = (res: any) => {
        console.log('extractComments() called');
        let temp: any = [];
        res.items.forEach((item: any) => {
            temp.push(item.snippet.topLevelComment.snippet.textDisplay);
        });
        let pageToken: any = null;
        if (res.hasOwnProperty('nextPageToken')) {
            pageToken = res.nextPageToken;
        }
        this.setState((prevState: any) => {
            return {
                sentences: prevState.sentences.concat(temp),
                pageToken: pageToken
            }
        }, () => {
            setTimeout(() => {
                this.fetchComments();
            }, 0);
        });
        console.log('extractComments() returned');
    }

    analyzeComments = () => {

        let sentiment = new Sentiment();
        this.state.sentences.forEach((item: any) => {
            let score = sentiment.analyze(item).score;
            if (score < 0) {
                this.setState((prevState: any) => {
                    return ({
                        percentages: {
                            ...prevState.percentages,
                            negative: prevState.percentages.negative + 1
                        }
                    });
                });
            } else if (score > 0) {
                this.setState((prevState: any) => {
                    return ({
                        percentages: {
                            ...prevState.percentages,
                            positive: prevState.percentages.positive + 1
                        }
                    });
                });
            } else {
                this.setState((prevState: any) => {
                    return ({
                        percentages: {
                            ...prevState.percentages,
                            neutral: prevState.percentages.neutral + 1
                        }
                    });
                });
            }
        });
        this.calculatePercentages();
    }

    calculatePercentages = () => {
        console.log('Analyzed');
        let positive = this.state.percentages.positive;
        let negative = this.state.percentages.negative;
        let neutral = this.state.percentages.neutral;
        let total = positive + negative + neutral;
        positive = (positive * 100) / (total);
        negative = (negative * 100) / (total);
        neutral = (neutral * 100) / (total);
        this.setState({
            percentages: {
                positive: positive,
                negative: negative,
                neutral: neutral
            }
        });
    };

    render() {
        return (
            <div className={"container"}>
                <input type="text" onChange={(e) => {
                    this.setState({videoId: e.target.value})
                }}/>
                <button onClick={this.fetchComments}>Analyze</button>
                <p>{JSON.stringify(this.state.percentages)}</p>
                <p>{JSON.stringify(this.state.sentences)}</p>
            </div>
        );
    }

}

export default Analyzer;
