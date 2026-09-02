export function LoginWallpaper() {
    return (
        <div className="login-page__visual-pan">
            <div className="login-page__visual-zoom">
                <img
                    src="/brand/background-light.avif"
                    alt=""
                    className="login-page__visual-img login-page__visual-img--light"
                    fetchPriority="high"
                    decoding="async"
                />
                <img
                    src="/brand/background-dark.avif"
                    alt=""
                    className="login-page__visual-img login-page__visual-img--dark"
                    decoding="async"
                />
            </div>
        </div>
    );
}
