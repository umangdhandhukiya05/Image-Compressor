const Header = () => {
  return (
    <nav className="flex justify-between items-center bg-blue-300 px-12 py-6">
      <h1 className="logo text-2xl text-blue-800">Image Compressor</h1>
      <button className="bg-pink-600 hover:bg-pink-400 hover:text-black text-white px-8 py-2 rounded-md">Login</button>
    </nav>
  )
}

export default Header