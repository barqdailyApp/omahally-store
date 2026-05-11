import "swiper/css";
import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";
import { Thumbs, Autoplay, Pagination } from "swiper/modules";

import { Card, Stack, Button, CardContent } from "@mui/material";

export default function ProductSwiper({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType>();

  return (
    <Card>
      <CardContent>
        <Swiper
          modules={[Autoplay, Pagination, Thumbs]}
          spaceBetween={20}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3000 }}
          style={{ borderRadius: "10px", maxWidth: "500px" }}
          onSlideChange={(s) => setActive(s.realIndex)}
          watchSlidesProgress
          onSwiper={(ev) => setSwiper(ev)}
        >
          {images?.map((item, index) => (
            <SwiperSlide key={index} style={{ overflow: "hidden" }}>
              <Image
                src={item}
                alt=" "
                width={500}
                height={500}
                style={{
                  borderRadius: "10px",
                  aspectRatio: "1/1",
                  objectFit: "contain",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length > 1 && (
          <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
            {images?.map((item, index) => (
              <Button
                variant="outlined"
                onClick={() => {
                  swiper?.slideTo(index);
                }}
                color={active === index ? "primary" : "inherit"}
              >
                <Image
                  src={item}
                  alt=" "
                  width={150}
                  height={150}
                  style={{
                    borderRadius: "10px",
                    aspectRatio: "1/1",
                    objectFit: "contain",
                  }}
                />
              </Button>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
