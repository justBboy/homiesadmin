import Image from "next/image";
import React, { useRef, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";

interface props {
  tstyles?: string;
  selected: string;
  setSelected: (s: string) => void;
}

const ImagePicker: React.FC<props> = ({ tstyles, selected, setSelected }) => {
  const [image, setImage] = useState<string | ArrayBuffer | null>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleFileChange = (e: any) => {
    console.log(e.target.value);
    const [file] = e.target.files;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className={`relative ${tstyles} relative rounded overflow-hidden`}>
      {image && <img src={image.toString()} className="w-full h-full" />}
      {!image && (
        <div
          onClick={handleClick}
          className="absolute w-full h-full left-0 top-0 cursor-pointer hover:bg-[#000000a9] bg-[#00000088] flex flex-col items-center justify-center"
        >
          <IoMdAdd color="white" className="text-xl" />
        </div>
      )}
      {image && (
        <div className="absolute top-0 left-0 w-full h-full hover:opacity-100 opacity-0 transition-opacity    ">
          <div className="w-full flex justify-end">
            <button className="mr-2" onClick={handleClick}>
              <AiOutlineEdit
                className="text-xl hover:text-blue-600"
                color="#fff"
              />
            </button>
          </div>
        </div>
      )}
      <input
        type="file"
        onChange={handleFileChange}
        ref={inputRef}
        multiple={false}
        accept="image/*"
        hidden
      />
    </div>
  );
};

export default ImagePicker;
