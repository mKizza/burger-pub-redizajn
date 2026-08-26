function IconsPage() {
  return (
    <div className="flex flex-row w-full justify-around items-start gap-5">
      <div className="flex flex-col items-center">
        <img src="/icons/sat.png" className="w-8 h-8 object-contain" />
        <span>10:30-23h</span>
      </div>

      <div className="flex flex-col items-center">
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Milbertshofener+Str.+34,+80807+München,+Germany"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/icons/location.png"
            className="w-8 h-8 object-contain cursor-pointer"
          />
        </a>

        <span>Milbertshofener Str. 34</span>
        <span>80807 München</span>
      </div>
    </div>
  );
}

export default IconsPage;
