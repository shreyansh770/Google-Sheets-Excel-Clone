grid.addEventListener("scroll", (e) => {

    let currDistFromTop = e.currentTarget.scrollTop;
    let currDistFromLeft = e.currentTarget.scrollLeft;

    columnTags.style.transform  = `translateX(-${currDistFromLeft})px`;
    rownNumbers.style.transform  = `translateY(-${currDistFromTop})px`;


})