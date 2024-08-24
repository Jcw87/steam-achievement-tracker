import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useAppBackground(app_id: string) {
    const url = `url(https://steamcdn-a.akamaihd.net/steam/apps/${app_id}/page_bg_generated_v6b.jpg)`;
    useEffect(() => {
        const origBackgroundAttachment = document.body.style.backgroundAttachment;
        const origBackgroundImage = document.body.style.backgroundImage;
        const origBackgroundPosition = document.body.style.backgroundPosition;
        const origBackgroundRepeat = document.body.style.backgroundRepeat;
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundImage = url;
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
        return () => {
            document.body.style.backgroundAttachment = origBackgroundAttachment;
            document.body.style.backgroundImage = origBackgroundImage;
            document.body.style.backgroundPosition = origBackgroundPosition;
            document.body.style.backgroundRepeat = origBackgroundRepeat;
        };
    }, [url]);
}

export function usePage(): [number, (page: number) => void] {
    const [query, setQuery] = useSearchParams();
    let page = parseInt(query.get("page") ?? "1", 10);
    if (isNaN(page)) {
        page = 1;
    }
    const setPage = useCallback((page: number) => {
        query.set("page", page.toString());
        setQuery(query);
    }, []);
    return [page, setPage];
}

export function useTitle(title: string) {
    useEffect(() => {
        const originalTitle = document.title;
        document.title = `${originalTitle} - ${title}`;
        return () => {document.title = originalTitle;};
    }, [title]);
}
