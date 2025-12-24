
onResize();
window.addEventListener('resize', onResize);

function onResize()
{
    if (window.innerWidth > 768)
    {
        adjustLayoutForDesktop();
    }
    {
        adjustLayoutForMobile();
    }
}

function adjustLayoutForMobile() 
{
    document.getElementById('logo').src="./app/resources/branding/logo-small.svg";
}

function adjustLayoutForDesktop()
{
    document.getElementById('logo').src="./app/resources/branding/logo-large.svg";
}