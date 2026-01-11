export default function Home() {
    return (
        <div className="flex flex-col h-screen w-screen justify-center items-center bg-background text-foreground font-sans gap-4">
            <a
                href="https://github.com/rushikeshg25/gh-widget/blob/master/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl font-bold no-underline hover:underline"
            >
                https://github.com/rushikeshg25/gh-widget
            </a>
            <a
                href="https://rushikeshg.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-gray-500 no-underline hover:underline"
            >
                https://rushikeshg.xyz
            </a>
        </div>
    );
}
