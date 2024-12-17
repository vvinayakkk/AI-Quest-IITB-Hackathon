const parseHashtags = (text = '') => {
  return text.split(/(\s+)/).map((part, index) =>
    part.startsWith('#') ? (
      <span key={index} className="text-accent hover:underline cursor-pointer">
        {part}
      </span>
    ) : part
  );
};

export { parseHashtags };