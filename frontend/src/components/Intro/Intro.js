import React from "react";
import { useSelector } from "react-redux";

const Intro = () => {
    const { user } = useSelector(store => store.generalReducer)

    return (
        <div className="content_container">
            <div className="welcome_div"><div>Welcome</div> <div>{user.userName || user.email}</div></div>
        </div>
    );
};

export default Intro;
