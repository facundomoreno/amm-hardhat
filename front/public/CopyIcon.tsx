const CopyIcon = ({ setCopied }: { setCopied: boolean }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={30}
      height={30}
      viewBox="0 0 64 64"
      fill={setCopied ? "#828282" : undefined}
    >
      <g id="Layer_100" data-name="Layer 100">
        <path d="M44.84,10.5H24.9a5,5,0,0,0-5,5V42.8a5,5,0,0,0,5,5H44.84a5,5,0,0,0,5-5V15.46A5,5,0,0,0,44.84,10.5Zm2,32.3a2,2,0,0,1-2,2H24.9a2,2,0,0,1-2-2V15.46a2,2,0,0,1,2-2H44.84a2,2,0,0,1,2,2Z"></path>
        <path d="M39.07,50.5H19.18a2,2,0,0,1-2-2V21.23a1.5,1.5,0,0,0-3,0V48.51a5,5,0,0,0,5,5H39.07A1.5,1.5,0,0,0,39.07,50.5Z"></path>
      </g>
    </svg>
  );
};

export default CopyIcon;
