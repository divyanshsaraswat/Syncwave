export default function TestGrid(){
    return(
        <>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] grid-rows-[repeat(auto-fit,minmax(100px,1fr))] max-w-screen-lg gap-4 p-2">
  <div className="bg-blue-500 text-white p-4  text-center">Item 1</div>
  {/* <div className="bg-green-500 text-white p-4 text-center">Item 2</div> */}
  <div className="bg-red-500 text-white p-4 text-center">Item 3</div>
  <div className="bg-yellow-500 text-white p-4 text-center">Item 4</div>
</div>

        </>
    )
}