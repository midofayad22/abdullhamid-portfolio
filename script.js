/* =========================================================
   FAYAD PORTFOLIO JS
   Professional / Lightweight / Accessible
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     DOM REFERENCES
  ======================================================= */

  const html = document.documentElement;
  const body = document.body;

  const header =
    document.getElementById("siteHeader");

  const mobileButton =
    document.getElementById("mobileMenuButton");

  const mobileMenu =
    document.getElementById("mobileMenu");

  const accessibilityButton =
    document.getElementById(
      "kwzds9"
    ) ||
    document.querySelector(
      ".accessibility-toggle"
    );

  const navLinks = [
    ...document.querySelectorAll(
      ".main-nav .nav-link[data-section]"
    )
  ];

  const mobileLinks = [
    ...document.querySelectorAll(
      ".mobile-menu a[data-section]"
    )
  ];

  const allNavLinks = [
    ...navLinks,
    ...mobileLinks
  ];

  const sections = [
    ...document.querySelectorAll(
      "main section[id]"
    )
  ];

  const revealElements = [
    ...document.querySelectorAll(
      ".reveal"
    )
  ];

  const projectCards = [
    ...document.querySelectorAll(
      ".project-card"
    )
  ];

  const galleryImages = [
    ...document.querySelectorAll(
      ".gallery-image img"
    )
  ];


  /* =======================================================
     REDUCED MOTION
  ======================================================= */

  const motionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  let reducedMotion =
    motionQuery.matches;

  const handleMotionPreference = () => {
    reducedMotion =
      motionQuery.matches;
  };

  if (
    typeof motionQuery.addEventListener ===
    "function"
  ) {
    motionQuery.addEventListener(
      "change",
      handleMotionPreference
    );
  } else if (
    typeof motionQuery.addListener ===
    "function"
  ) {
    motionQuery.addListener(
      handleMotionPreference
    );
  }


  /* =======================================================
     HELPERS
  ======================================================= */

  function getHeaderHeight() {
    return header?.offsetHeight || 80;
  }


  function isMobileMenuOpen() {
    return Boolean(
      mobileMenu?.classList.contains(
        "is-open"
      )
    );
  }


  function getSectionId(link) {
    if (!link) {
      return null;
    }

    const dataId =
      link.getAttribute(
        "data-section"
      );

    if (dataId) {
      return dataId;
    }

    const href =
      link.getAttribute("href");

    if (
      href &&
      href.startsWith("#") &&
      href.length > 1
    ) {
      return href.slice(1);
    }

    return null;
  }


  function getScrollBehavior() {
    return reducedMotion
      ? "auto"
      : "smooth";
  }


  /* =======================================================
     HEADER SCROLL STATE
  ======================================================= */

  let scrollTicking = false;

  function updateHeader() {
    if (!header) {
      return;
    }

    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 25
    );

    scrollTicking = false;
  }


  function requestHeaderUpdate() {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;

    window.requestAnimationFrame(
      updateHeader
    );
  }


  window.addEventListener(
    "scroll",
    requestHeaderUpdate,
    {
      passive: true
    }
  );

  updateHeader();


  /* =======================================================
     MOBILE MENU
  ======================================================= */

  function closeMobileMenu() {
    if (
      !mobileMenu ||
      !mobileButton
    ) {
      return;
    }

    mobileMenu.classList.remove(
      "is-open"
    );

    mobileButton.classList.remove(
      "is-open"
    );

    mobileButton.setAttribute(
      "aria-expanded",
      "false"
    );

    body.classList.remove(
      "menu-open"
    );
  }


  function openMobileMenu() {
    if (
      !mobileMenu ||
      !mobileButton
    ) {
      return;
    }

    mobileMenu.classList.add(
      "is-open"
    );

    mobileButton.classList.add(
      "is-open"
    );

    mobileButton.setAttribute(
      "aria-expanded",
      "true"
    );

    body.classList.add(
      "menu-open"
    );
  }


  function toggleMobileMenu() {
    if (
      !mobileMenu ||
      !mobileButton
    ) {
      return;
    }

    if (isMobileMenuOpen()) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }


  mobileButton?.addEventListener(
    "click",
    toggleMobileMenu
  );


  mobileLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        closeMobileMenu
      );
    }
  );


  /*
    Close the mobile menu when the
    viewport returns to desktop.
  */

  window.addEventListener(
    "resize",
    () => {
      if (
        window.innerWidth > 850 &&
        isMobileMenuOpen()
      ) {
        closeMobileMenu();
      }
    },
    {
      passive: true
    }
  );


  /*
    Close when clicking outside
    the menu and menu button.
  */

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (
        !isMobileMenuOpen() ||
        !mobileMenu ||
        !mobileButton
      ) {
        return;
      }

      const target =
        event.target;

      if (
        !(target instanceof Node)
      ) {
        return;
      }

      const clickedMenu =
        mobileMenu.contains(target);

      const clickedButton =
        mobileButton.contains(target);

      if (
        !clickedMenu &&
        !clickedButton
      ) {
        closeMobileMenu();
      }
    }
  );


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setActiveNav(id) {
    if (!id) {
      return;
    }

    navLinks.forEach(
      (link) => {

        const active =
          getSectionId(link) === id;

        link.classList.toggle(
          "active",
          active
        );

        link.classList.toggle(
          "is-active",
          active
        );

        if (active) {
          link.setAttribute(
            "aria-current",
            "page"
          );
        } else {
          link.removeAttribute(
            "aria-current"
          );
        }
      }
    );
  }


  function scrollToSection(id) {
    const section =
      document.getElementById(id);

    if (!section) {
      return;
    }

    const headerHeight =
      getHeaderHeight();

    const target =
      section.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      15;

    window.scrollTo({
      top: Math.max(
        target,
        0
      ),
      behavior:
        getScrollBehavior()
    });
  }


  allNavLinks.forEach(
    (link) => {

      const id =
        getSectionId(link);

      /*
        Leave external/page links alone.
        Example:
        gallery.html
        projects.html
      */

      if (!id) {
        return;
      }

      link.addEventListener(
        "click",
        (event) => {

          const section =
            document.getElementById(id);

          /*
            If the ID doesn't exist,
            don't interfere with the link.
          */

          if (!section) {
            return;
          }

          event.preventDefault();

          setActiveNav(id);

          scrollToSection(id);

          closeMobileMenu();
        }
      );
    }
  );


  /* =======================================================
     ACTIVE SECTION OBSERVER
  ======================================================= */

  if (
    "IntersectionObserver" in window &&
    sections.length
  ) {

    const sectionObserver =
      new IntersectionObserver(
        (entries) => {

          const visibleSections =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (
            !visibleSections.length
          ) {
            return;
          }

          const activeSection =
            visibleSections[0]
              .target
              .id;

          const hasNavLink =
            navLinks.some(
              (link) =>
                getSectionId(link) ===
                activeSection
            );

          if (hasNavLink) {
            setActiveNav(
              activeSection
            );
          }
        },
        {
          rootMargin:
            "-22% 0px -62% 0px",

          threshold: [
            0,
            0.2,
            0.4,
            0.7
          ]
        }
      );

    sections.forEach(
      (section) => {
        sectionObserver.observe(
          section
        );
      }
    );
  }


  /* =======================================================
     REVEAL ANIMATION
  ======================================================= */

  if (
    "IntersectionObserver" in window &&
    !reducedMotion &&
    revealElements.length
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach(
            (entry) => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              entry.target.classList.add(
                "revealed"
              );

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.08,

          rootMargin:
            "0px 0px -45px"
        }
      );


    revealElements.forEach(
      (element, index) => {

        /*
          Only stagger elements that
          are close to each other.
          This prevents a long delay
          on large pages.
        */

        const delay =
          Math.min(
            index % 5 * 55,
            220
          );

        element.style.transitionDelay =
          `${delay}ms`;

        revealObserver.observe(
          element
        );
      }
    );

  } else {

    /*
      Important fallback:
      content must remain visible
      if IntersectionObserver is
      unavailable or motion is reduced.
    */

    revealElements.forEach(
      (element) => {
        element.classList.add(
          "is-visible"
        );

        element.classList.add(
          "revealed"
        );
      }
    );
  }


  /* =======================================================
     HERO TYPING ROLE
  ======================================================= */

  const typingElement =
    document.getElementById(
      "typingRole"
    );

  const roles = [
    "Front-End Experiences",
    "Responsive Interfaces",
    "React Applications",
    "Real Web Products"
  ];


  if (
    typingElement &&
    !reducedMotion &&
    roles.length
  ) {

    let roleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let typingTimer = null;


    function typeRole() {

      if (
        !typingElement.isConnected
      ) {
        return;
      }

      const currentRole =
        roles[roleIndex];


      if (!deleting) {

        characterIndex += 1;

        typingElement.textContent =
          currentRole.slice(
            0,
            characterIndex
          );


        if (
          characterIndex >=
          currentRole.length
        ) {

          deleting = true;

          typingTimer =
            window.setTimeout(
              typeRole,
              1700
            );

          return;
        }

      } else {

        characterIndex -= 1;

        typingElement.textContent =
          currentRole.slice(
            0,
            characterIndex
          );


        if (
          characterIndex <= 0
        ) {

          deleting = false;

          roleIndex =
            (
              roleIndex + 1
            ) %
            roles.length;
        }
      }


      typingTimer =
        window.setTimeout(
          typeRole,
          deleting
            ? 42
            : 78
        );
    }


    typingTimer =
      window.setTimeout(
        typeRole,
        850
      );


    /*
      Stop the timer when the page
      is hidden to avoid unnecessary
      background work.
    */

    document.addEventListener(
      "visibilitychange",
      () => {

        if (
          document.hidden &&
          typingTimer
        ) {
          window.clearTimeout(
            typingTimer
          );
        }

        if (
          !document.hidden &&
          !typingTimer
        ) {
          typingTimer =
            window.setTimeout(
              typeRole,
              500
            );
        }
      }
    );
  }


  /* =======================================================
     PROJECT POINTER GLOW
  ======================================================= */

  projectCards.forEach(
    (card) => {

      card.style.setProperty(
        "--mx",
        "50%"
      );

      card.style.setProperty(
        "--my",
        "50%"
      );


      card.addEventListener(
        "pointermove",
        (event) => {

          /*
            Ignore this effect on
            touch/mobile devices.
          */

          if (
            window.innerWidth < 851 ||
            event.pointerType ===
              "touch"
          ) {
            return;
          }


          const rect =
            card.getBoundingClientRect();

          if (
            !rect.width ||
            !rect.height
          ) {
            return;
          }


          const x =
            (
              (
                event.clientX -
                rect.left
              ) /
              rect.width
            ) *
            100;


          const y =
            (
              (
                event.clientY -
                rect.top
              ) /
              rect.height
            ) *
            100;


          card.style.setProperty(
            "--mx",
            `${x}%`
          );

          card.style.setProperty(
            "--my",
            `${y}%`
          );

          card.classList.add(
            "pointer-active"
          );
        }
      );


      card.addEventListener(
        "pointerleave",
        () => {

          card.classList.remove(
            "pointer-active"
          );

          card.style.setProperty(
            "--mx",
            "50%"
          );

          card.style.setProperty(
            "--my",
            "50%"
          );
        }
      );
    }
  );


  /* =======================================================
     PROJECT VISUAL TILT
  ======================================================= */

  if (!reducedMotion) {

    projectCards.forEach(
      (card) => {

        const visual =
          card.querySelector(
            ".project-visual"
          );

        if (!visual) {
          return;
        }


        let tiltActive = false;


        visual.addEventListener(
          "pointermove",
          (event) => {

            if (
              window.innerWidth < 851 ||
              event.pointerType ===
                "touch"
            ) {
              return;
            }


            const rect =
              visual.getBoundingClientRect();

            if (
              !rect.width ||
              !rect.height
            ) {
              return;
            }


            const x =
              (
                event.clientX -
                rect.left
              ) /
              rect.width -
              0.5;


            const y =
              (
                event.clientY -
                rect.top
              ) /
              rect.height -
              0.5;


            /*
              Very small rotation.
              The goal is depth, not a
              "3D card gimmick".
            */

            const rotateX =
              -y * 2;

            const rotateY =
              x * 2;


            visual.style.transform =
              `perspective(1000px)
               rotateX(${rotateX}deg)
               rotateY(${rotateY}deg)`;


            tiltActive = true;
          }
        );


        visual.addEventListener(
          "pointerleave",
          () => {

            if (!tiltActive) {
              return;
            }

            visual.style.transform =
              "";

            tiltActive = false;
          }
        );
      }
    );
  }


  /* =======================================================
     GALLERY IMAGE OPTIMIZATION
  ======================================================= */

  galleryImages.forEach(
    (image, index) => {

      /*
        The first gallery image is
        loaded normally because it
        may appear near the viewport.

        The remaining images are lazy.
      */

      if (index > 0) {
        image.loading = "lazy";
      }

      image.decoding = "async";

      /*
        Prevent broken images from
        producing ugly browser UI.
      */

      image.addEventListener(
        "error",
        () => {
          image.classList.add(
            "image-error"
          );
        },
        {
          once: true
        }
      );
    }
  );


  /* =======================================================
     GALLERY / INTERNAL LINKS
  ======================================================= */

  document
    .querySelectorAll(
      ".gallery-link"
    )
    .forEach(
      (link) => {

        const sectionId =
          getSectionId(link);

        /*
          If gallery-link points to
          a real section, use the same
          smooth navigation system.
        */

        if (!sectionId) {
          return;
        }

        const section =
          document.getElementById(
            sectionId
          );

        if (!section) {
          return;
        }

        link.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            scrollToSection(
              sectionId
            );
          }
        );
      }
    );


  /* =======================================================
     EXTERNAL LINK SECURITY
  ======================================================= */

  document
    .querySelectorAll(
      'a[target="_blank"]'
    )
    .forEach(
      (link) => {

        const rel =
          link.getAttribute(
            "rel"
          ) || "";


        const values =
          new Set(
            rel
              .split(/\s+/)
              .filter(Boolean)
          );


        values.add(
          "noopener"
        );

        values.add(
          "noreferrer"
        );


        link.setAttribute(
          "rel",
          [...values].join(" ")
        );
      }
    );


  /* =======================================================
     BUTTON PRESS EFFECT
  ======================================================= */

  const interactiveElements = [
    ".button",
    ".project-link",
    ".header-contact",
    ".gallery-link",
    ".contact-card",
    ".footer-right a"
  ].join(", ");


  document
    .querySelectorAll(
      interactiveElements
    )
    .forEach(
      (element) => {

        const pressStart = () => {
          element.classList.add(
            "is-pressed"
          );
        };


        const pressEnd = () => {
          element.classList.remove(
            "is-pressed"
          );
        };


        element.addEventListener(
          "pointerdown",
          pressStart
        );

        element.addEventListener(
          "pointerup",
          pressEnd
        );

        element.addEventListener(
          "pointerleave",
          pressEnd
        );

        element.addEventListener(
          "pointercancel",
          pressEnd
        );
      }
    );


  /* =======================================================
     ACCESSIBILITY MODE
  ======================================================= */

  if (accessibilityButton) {

    const accessibilityStyle =
      document.createElement(
        "style"
      );

    accessibilityStyle.id =
      "accessibilityStyles";


    accessibilityStyle.textContent = `
      html.accessibility-mode {
        scroll-behavior: auto !important;
      }

      html.accessibility-mode *,
      html.accessibility-mode *::before,
      html.accessibility-mode *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      html.accessibility-mode :focus-visible {
        outline:
          3px solid #087d73 !important;

        outline-offset:
          5px !important;
      }

      html.accessibility-mode .reveal {
        opacity: 1 !important;
        transform: none !important;
      }
    `;


    document.head.appendChild(
      accessibilityStyle
    );


    accessibilityButton.setAttribute(
      "aria-expanded",
      "false"
    );


    /*
      Restore accessibility mode
      from the previous visit.
    */

    let savedAccessibility =
      false;


    try {
      savedAccessibility =
        localStorage.getItem(
          "fayad-accessibility-mode"
        ) === "true";
    } catch {
      savedAccessibility = false;
    }


    if (savedAccessibility) {

      html.classList.add(
        "accessibility-mode"
      );

      accessibilityButton.classList.add(
        "is-active"
      );

      accessibilityButton.setAttribute(
        "aria-expanded",
        "true"
      );
    }


    function updateAccessibilityState(
      enabled
    ) {

      accessibilityButton.setAttribute(
        "aria-expanded",
        String(enabled)
      );

      accessibilityButton.setAttribute(
        "aria-label",
        enabled
          ? "Disable accessibility mode"
          : "Open accessibility options"
      );

      accessibilityButton.classList.toggle(
        "is-active",
        enabled
      );


      try {
        localStorage.setItem(
          "fayad-accessibility-mode",
          String(enabled)
        );
      } catch {
        /*
          Storage may be unavailable.
          The feature still works.
        */
      }
    }


    updateAccessibilityState(
      savedAccessibility
    );


    accessibilityButton.addEventListener(
      "click",
      () => {

        const enabled =
          html.classList.toggle(
            "accessibility-mode"
          );


        updateAccessibilityState(
          enabled
        );
      }
    );
  }


  /* =======================================================
     BACK TO TOP
  ======================================================= */

  document
    .querySelectorAll(
      'a[href="#top"]'
    )
    .forEach(
      (link) => {

        link.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            window.scrollTo({
              top: 0,

              behavior:
                getScrollBehavior()
            });

            closeMobileMenu();
          }
        );
      }
    );


  /* =======================================================
     KEYBOARD SUPPORT
  ======================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      /*
        Escape closes the mobile
        menu and clears pressed states.
      */

      if (
        event.key === "Escape"
      ) {

        closeMobileMenu();

        document
          .querySelectorAll(
            ".is-pressed"
          )
          .forEach(
            (element) => {
              element.classList.remove(
                "is-pressed"
              );
            }
          );
      }
    }
  );


  /* =======================================================
     MOBILE MENU ACCESSIBILITY
  ======================================================= */

  if (mobileButton) {

    if (
      !mobileButton.hasAttribute(
        "aria-expanded"
      )
    ) {
      mobileButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }


    if (
      mobileMenu &&
      !mobileButton.hasAttribute(
        "aria-controls"
      )
    ) {

      const menuId =
        mobileMenu.id ||
        "mobileMenu";

      mobileMenu.id = menuId;

      mobileButton.setAttribute(
        "aria-controls",
        menuId
      );
    }
  }


  /* =======================================================
     PAGE VISIBILITY
  ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      /*
        When the user returns to the
        tab, refresh the header state.
      */

      if (!document.hidden) {
        updateHeader();
      }
    }
  );


  /* =======================================================
     SERVICE WORKER
  ======================================================= */

  if (
    "serviceWorker" in navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {
            /*
              Service worker is optional.
              The portfolio continues
              normally if registration fails.
            */
          });
      }
    );
  }


  /* =======================================================
     INITIAL STATE
  ======================================================= */

  /*
    Prevent the page from starting
    with an incorrect mobile-menu
    state.
  */

  if (
    window.innerWidth > 850
  ) {
    closeMobileMenu();
  }


  /*
    If the visitor loads the page
    directly at a hash URL, update
    the active navigation item.
  */

  if (
    window.location.hash.length > 1
  ) {

    const initialId =
      window.location.hash.slice(1);

    const initialSection =
      document.getElementById(
        initialId
      );

    if (initialSection) {
      setActiveNav(
        initialId
      );
    }
  }

})();