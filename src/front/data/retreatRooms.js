import privateRoomImage from "../images/habIndi.png";
import doubleRoomImage from "../images/hab2.png";
import sharedRoomImage from "../images/hab4.png";

const fallbackImages = {
    private: privateRoomImage,
    double: doubleRoomImage,
    shared: sharedRoomImage
};

export const normalizeRoom = room => {

    const photos = [...new Set([
        room.image_url || fallbackImages[room.slug],
        room.second_image_url,
        room.third_image_url
    ].filter(Boolean))];

    return {
        ...room,
        image: photos[0],
        gallery: photos.map(src => ({
            src,
            caption: room.name
        }))
    };
};

export const formatRetreatDates = (retreat, locale) => {

    if (!retreat?.start_date) return "";

    const format = value => new Intl.DateTimeFormat(
        locale,
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }
    ).format(
        new Date(value.slice(0, 10) + "T00:00:00Z")
    );

    return [
        retreat.start_date,
        retreat.end_date
    ].filter(Boolean).map(format).join(" – ");
};