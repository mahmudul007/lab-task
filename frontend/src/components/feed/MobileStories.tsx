const mobileStoriesList = [
  { img: '/images/mobile_story_img.png', name: 'Your Story', type: 'own' },
  { img: '/images/mobile_story_img1.png', name: 'Ryan...', type: 'active' },
  { img: '/images/mobile_story_img2.png', name: 'Ryan...', type: 'inactive' },
  { img: '/images/mobile_story_img1.png', name: 'Ryan...', type: 'active' },
  { img: '/images/mobile_story_img2.png', name: 'Ryan...', type: 'inactive' },
];

export const MobileStories = () => {
  return (
    <div className="_feed_inner_ppl_card_mobile _mar_b16">
      <div className="_feed_inner_ppl_card_area">
        <ul className="_feed_inner_ppl_card_area_list">
          {mobileStoriesList.map((s, i) => (
            <li className="_feed_inner_ppl_card_area_item" key={i}>
              <a href="#0" className="_feed_inner_ppl_card_area_link">
                <div className={s.type === 'own' ? '_feed_inner_ppl_card_area_story' : s.type === 'active' ? '_feed_inner_ppl_card_area_story_active' : '_feed_inner_ppl_card_area_story_inactive'}>
                  <img src={s.img} alt="Image" className={s.type === 'own' ? '_card_story_img' : '_card_story_img1'} />
                  {s.type === 'own' && (
                    <div className="_feed_inner_ppl_btn">
                      <button className="_feed_inner_ppl_btn_link" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                          <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {s.type === 'own' ? (
                  <p className="_feed_inner_ppl_card_area_link_txt">{s.name}</p>
                ) : (
                  <p className="_feed_inner_ppl_card_area_txt">{s.name}</p>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
