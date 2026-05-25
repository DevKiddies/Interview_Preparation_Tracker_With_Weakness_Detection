function TestTailWind() {
  return (
    // A simple component to test if Tailwind CSS is working
    <>
      {/* This is a test heading to check if Tailwind CSS is working. It should be bold and have a font size of 2xl. It also has center alignment. */}
      <div
        className="
      min-h-screen
      bg-[url('/Uncharted.jpg')]
      bg-fixed
      bg-center
      bg-cover
      bg-no-repeat
      text-white"
      >
        <div className="text-4xl font-bold text-center text-yellow-100 sticky top-0 bg-amber-300/60 backdrop-blur-md z-20">
          <p className="text-4xl font-bold text-center text-yellow-950">
            SIC . PARVIS . MAGNA .
          </p>
        </div>
        <h1 className="text-3xl font-bold text-white text-center mt-4">
          Test Heading
        </h1>
        <p>
          This is a test paragraph to check if Tailwind CSS is working. Tailwind
          is pure custom CSS with a twist of utility classes. So it doesn't
          allow browser-specific styles. And hence the h1 heading above appears
          smaller than expected.
        </p>
        <br />
        <h2 className="font-mono">This is h2 heading</h2>
        <br />
        <h2 className="text-2xl font-light text-amber-500 bg-blue-950">
          This is another h2 heading but with bigger font size and light weight
          and a different color. Also, the bg-color-value (bg-blue-950) is
          applied to only the background of this tag in tailwind.
        </h2>
        <br />
        <section className="font-medium text-amber-200 bg-pink-700 p-4 space-y-4">
          <p>
            This is a section with a paragraph to show how styling properties
            get inherited from parent elements to child elements. The current
            padding given to this section is p-4{" "}
          </p>
          <p>
            This is another paragraph within the same section. But since we've
            applied space-y-4, there should be some vertical spacing between the
            paragraphs.
          </p>
          <main>
            <p className="bg-yellow-300 text-2xl text-blue-950">
              This is the main section.
            </p>
            <p>
              It has no styling properties applied to it. So it should inherit
              the default styles of the section that it's nested within.
            </p>
          </main>
        </section>

        <section className="m-4 p-4 bg-green-800 text-white shadow-2xl shadow-black">
          <p>
            This is a paragraph within a separate section. But since we've
            applied m-4 and p-4, there should be some margin and padding around
            this section.{" "}
            <p className="text-lime-300 text-2xl text-center font-mono">
              ALSO, SHADOW FOR NO REASON XD
            </p>
          </p>
        </section>
        <section
          className="mx-8 
        bg-blue-500 text-amber-200 border-pink-600
        font-semibold px-8 py-4 border-8  mt-4 mb-4 drop-shadow-lg"
        >
          <p>
            This is a paragraph within another section. But since we've applied
            mx-8, there should be some horizontal margin around this section.
            Also, the background color of this section is blue-500 and the text
            color is amber-200. The padding is px-8 and py-4. And the border is
            border-8 and border-pink-600.
          </p>
        </section>
        <section className="max-w-2xl mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg border-4 border-gray-600 mt-8 mb-8 opacity-90">
          <h2 className="text-2xl font-bold mb-4">
            This is a section with max-width and auto margin and opacity to 90.
          </h2>
          <p>
            This section has a maximum width of 2xl and is centered horizontally
            using mx-auto. The background color is gray-800, the text color is
            white, and it has padding of 6. The corners are rounded with
            rounded-lg, and it has a shadow with shadow-lg. Additionally, it has
            a border of 4 and border-gray-600. The margin on the top and bottom
            is 8.
          </p>
        </section>

        <section
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                            p-6 rounded-lg shadow-lg border-4 border-gray-600 mt-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-center text-yellow-100">
            This is text customization section.
          </h1>
          <p>
            This is a paragraph within the text customization section. It has a
            gradient background and white text.{" "}
          </p>
          <p className="italic">This is an italicized paragraph.</p>
          <p className="underline">This is an underlined paragraph.</p>
          <p className="line-through">This is a strikethrough paragraph.</p>
          <p className="overline">This is an overline paragraph.</p>
          <p className="uppercase">This is an uppercase paragraph.</p>
          <p className="lowercase">THIS IS A LOWERCASE PARAGRAPH.</p>
          <p className="capitalize">this is a capitalized paragraph.</p>
          <p className="tracking-widest">
            This is a paragraph with the widest tracking. It has the widest
            letter spacing available in Tailwind CSS.
          </p>
          <p className="tracking-tight">
            This is a paragraph with tight tracking.
          </p>
          <p className="leading-loose">
            This is a paragraph with loose leading.
          </p>
          <p className="leading-tight">
            This is a paragraph with tight leading.
          </p>
          <p className="leading-0">This is a paragraph with 0 leading.</p>
          <p className="leading-20">This is a paragraph with 20 leading.</p>
          <p className="drop-shadow-lg">
            This is a paragraph with a drop shadow.
          </p>
          <p className="bg-yellow-300 inline text-black">
            Highlighted This is a paragraph with an inline highlighted text.
          </p>
          H<sub className="text-sm">2</sub>O is the chemical formula for water.
          The <sup className="text-sm">2</sup> in H<sub>2</sub>O is a subscript,
          and the <sup className="text-sm">2</sup> in H<sub>2</sub>O is a
          superscript.
          <br />
          <div className="text-center">
            This is a paragraph with text center alignment.
          </div>
          <p className="hover:text-amber-200">Hover over me!</p>
          <a href="#" className="hover:underline">
            Hover over me to underline me!
          </a>
          <h1 className="text-2xl md:text-4xl lg:text-6xl">
            This is a heading with responsive text sizes.
          </h1>
          <h1 className="text-2xl font-bold drop-shadow-lg [text-shadow:2px_2px_5px_black]">
            Hello. This is a heading with a custom text shadow using the
            arbitrary value syntax in Tailwind CSS. The text shadow is defined
            as 2px 2px 5px black, which creates a shadow that is offset by 2
            pixels horizontally and vertically, with a blur radius of 5 pixels
            and a color of black.
          </h1>
          <h1 className="text-2xl font-bold drop-shadow-lg [text-shadow:0px_0px_10px_white]">
            This is a heading with a white text shadow which appears to be
            glowing.
          </h1>
        </section>

        <article className="max-w-2xl mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg border-4 border-gray-600 mt-8 mb-0 opacity-90">
          <time>Mar 10, 2020</time>
          <br />
          <br />
          <p class="line-clamp-3">
            This is a paragraph that demonstrates the line-clamp utility in
            Tailwind CSS. The line-clamp-3 class will limit the text to 3 lines
            and add an ellipsis (...) at the end if the text exceeds 3 lines.
            This is useful for creating a preview of longer text content, such
            as blog posts or product descriptions, while maintaining a clean and
            organized layout.
          </p>
          <div>
            <img src="/img/lindsay.jpg" />
            Lindsay Walton
          </div>
        </article>
      </div>
    </>
  );
}

export default TestTailWind;
