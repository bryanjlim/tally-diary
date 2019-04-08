import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import "typeface-roboto";
import logo from "./TextLogo.jpg";
import Apple from "./apple.png";
import Google from "./google.png";
import Microsoft from "./microsoft.png";

class Get extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isImageLoaded: false
    };
    this.onImageLoad = this.onImageLoad.bind(this);
  }

  onImageLoad() {
    this.setState({ isImageLoaded: true });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={this.state.isImageLoaded ? classes.show : classes.hide}>
        <div className={classes.outerContainer}>
          <div className={classes.middleContainer}>
            <div className={classes.innerContainer}>
              <div className={classes.home}>
                <div className={classes.logoWrapper}>
                  <img
                    className={classes.logoImage}
                    onLoad={this.onImageLoad}
                    alt="Tally Diary Logo"
                    src={logo}
                  />
                </div>
                <div className={classes.downloadContainer}>
                  <div className={classes.downloadImageWrapper}>
                    <a href="//www.microsoft.com/store/apps/9mv96l9ws9lg?cid=storebadge&ocid=badge">
                      <img
                        src={Microsoft}
                        alt="Microsoft Store badge"
                        className={classes.downloadImage}
                      />
                    </a>
                  </div>
                  <div className={classes.downloadImageWrapper}>
                    <a href="itms://itunes.apple.com/us/app/tally-diary/id1458258521?ls=1&mt=8">
                      <img
                        src={Apple}
                        alt="Apple Store badge"
                        className={classes.downloadImage}
                      />
                    </a>
                  </div>
                  <div className={classes.downloadImageWrapper}>
                    <a href="https://play.google.com/store/apps/details?id=com.tallydiary">
                      <img
                        src={Google}
                        alt="Google Play badge"
                        className={classes.downloadImage}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = theme => ({
  hide: {
    display: "none"
  },
  logoImage: {
    display: "block",
    margin: "0 auto",
    width: 350,
    [theme.breakpoints.down("sm")]: {
      width: 250
    }
  },
  downloadContainer: {
    marginTop: 50,
    margin: "0 auto",
    textAlign: "center"
  },
  downloadImageWrapper: {
    marginLeft: 15,
    display: "inline-block"
  },
  downloadImage: {
    height: 50
  },
  outerContainer: {
    fontFamily: "Roboto",
    display: "table",
    position: "absolute",
    height: "98%",
    width: "98%"
  },
  middleContainer: {
    display: "table-cell",
    verticalAlign: "middle"
  },
  innerContainer: {
    marginLeft: "auto",
    marginRight: "auto"
  },
  home: {
    fontFamily: "Roboto"
  },
  homeTitle: {
    color: theme.palette.primary.main,
    textAlign: "center",
    margin: ".55em",
    marginBottom: "1em",
    [theme.breakpoints.down("sm")]: {
      fontSize: 20
    }
  },
  containerWrapper: {
    width: 255,
    margin: "0 auto"
  }
});

Get.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Get);
